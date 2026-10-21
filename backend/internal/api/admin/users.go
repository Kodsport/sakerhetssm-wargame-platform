package admin

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"math"
	"net/http"
	"os"
	"sort"

	"github.com/sakerhetsm/ssm-wargame/internal/auth"
	spec "github.com/sakerhetsm/ssm-wargame/internal/gen/admin"
	"github.com/sakerhetsm/ssm-wargame/internal/models"
	"github.com/sakerhetsm/ssm-wargame/internal/utils"
	"github.com/volatiletech/sqlboiler/v4/boil"
	"github.com/volatiletech/sqlboiler/v4/queries/qm"
	"go.uber.org/zap"
)

func (s *service) ListUsers(ctx context.Context, req *spec.ListUsersPayload) ([]*spec.SsmUser, error) {
	users, err := models.Users().All(ctx, s.db)
	if err != nil {
		s.log.Warn("could not list users", zap.Error(err), utils.C(ctx))
		return nil, err
	}

	res := make([]*spec.SsmUser, len(users))
	for i, u := range users {
		res[i] = &spec.SsmUser{
			ID:        u.ID,
			Email:     u.Email,
			FullName:  u.FullName,
			Role:      u.Role,
			SchoolID:  u.SchoolID.Ptr(),
			DiscordID: u.DiscordID.Ptr(),
		}
	}

	return res, nil
}

// discriminator är gamla tags typ alanoo#3846. de anvnds frf på gamla konton
func (s *service) GetDiscordUser(ctx context.Context, req *spec.GetDiscordUserPayload) (*spec.SsmDiscordUser, error) {
	botToken := os.Getenv("DISCORD_BOT_TOKEN")
	if botToken == "" {
		s.log.Warn("discord bot token not configured in env", utils.C(ctx))
		return nil, fmt.Errorf("discord bot token not configured in env")
	}

	url := fmt.Sprintf("https://discord.com/api/v10/users/%s", req.DiscordID)
	httpReq, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		s.log.Warn("failed to create discord API request :(", zap.Error(err), utils.C(ctx))
		return nil, err
	}

	httpReq.Header.Set("Authorization", fmt.Sprintf("Bot %s", botToken))
	httpReq.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(httpReq)
	if err != nil {
		s.log.Warn("failed to get discord user", zap.Error(err), utils.C(ctx))
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		s.log.Warn("Discord API returned error", zap.Int("status", resp.StatusCode), utils.C(ctx))
		return nil, fmt.Errorf("Discord API error: %d", resp.StatusCode)
	}

	var discordUser struct {
		ID            string  `json:"id"`
		Username      string  `json:"username"`
		Discriminator string  `json:"discriminator"`
		Avatar        *string `json:"avatar"`
		GlobalName    *string `json:"global_name"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&discordUser); err != nil {
		s.log.Warn("failed att decodea Discord user response", zap.Error(err), utils.C(ctx))
		return nil, err
	}

	result := &spec.SsmDiscordUser{
		ID:            discordUser.ID,
		Username:      discordUser.Username,
		Discriminator: &discordUser.Discriminator,
		GlobalName:    discordUser.GlobalName,
	}

	if discordUser.Avatar != nil {
		result.Avatar = discordUser.Avatar
	}

	return result, nil
}

func (s *service) GetUserDetails(ctx context.Context, req *spec.GetUserDetailsPayload) (*spec.SsmAdminUserdetails, error) {
	user, err := models.Users(models.UserWhere.ID.EQ(req.UserID)).One(ctx, s.db)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, spec.MakeNotFound(fmt.Errorf("user not found"))
		}
		s.log.Error("could not get user", zap.Error(err), utils.C(ctx))
		return nil, err
	}

	challenges, err := models.Challenges().All(ctx, s.db)
	if err != nil {
		s.log.Error("could not get challenges", zap.Error(err), utils.C(ctx))
		return nil, err
	}

	// map funktion
	challengeMap := make(map[string]*models.Challenge)
	for _, chall := range challenges {
		challengeMap[chall.ID] = chall
	}

	submissions, err := models.Submissions(
		models.SubmissionWhere.UserID.EQ(user.ID),
		qm.OrderBy(models.SubmissionColumns.CreatedAt+" DESC"),
	).All(ctx, s.db)
	if err != nil {
		s.log.Error("could not get user submissions", zap.Error(err), utils.C(ctx))
		return nil, err
	}

	solves, err := models.UserSolves(
		models.UserSolfWhere.UserID.EQ(user.ID),
	).All(ctx, s.db)
	if err != nil {
		s.log.Error("could not get user solves", zap.Error(err), utils.C(ctx))
		return nil, err
	}

	solvedMap := make(map[string]bool, len(solves))
	for _, solve := range solves {
		solvedMap[solve.ChallengeID] = true
	}

	var successful, failed int
	hourlyActivity := make([]int, 24)
	challengeSubmissionsMap := make(map[string]*spec.ChallengeSubmissionsGroup)
	for _, submission := range submissions {
		if submission.Successful {
			successful++
		} else {
			failed++
		}

		hour := submission.CreatedAt.Hour()
		hourlyActivity[hour]++

		challenge, exists := challengeMap[submission.ChallengeID]
		if !exists {
			continue
		}

		if _, exists := challengeSubmissionsMap[submission.ChallengeID]; !exists {
			challengeSubmissionsMap[submission.ChallengeID] = &spec.ChallengeSubmissionsGroup{
				ChallengeID:    submission.ChallengeID,
				ChallengeTitle: challenge.Title,
				ChallengeSlug:  challenge.Slug,
				Solved:         solvedMap[submission.ChallengeID],
				Submissions:    []*spec.ChallengeSubmission{},
			}
		}

		challengeSubmissionsMap[submission.ChallengeID].Submissions = append(
			challengeSubmissionsMap[submission.ChallengeID].Submissions,
			&spec.ChallengeSubmission{
				ID:          submission.ID,
				UserID:      submission.UserID,
				Input:       submission.Input,
				Successful:  submission.Successful,
				SubmittedAt: submission.CreatedAt.Unix(),
			},
		)
	}

	// slicey slicey
	challengeSubmissions := make([]*spec.ChallengeSubmissionsGroup, 0, len(challengeSubmissionsMap))
	for _, group := range challengeSubmissionsMap {
		challengeSubmissions = append(challengeSubmissions, group)
	}

	sort.Slice(challengeSubmissions, func(i, j int) bool {
		return challengeSubmissions[i].ChallengeTitle < challengeSubmissions[j].ChallengeTitle
	})

	total := successful + failed
	successRate := 0
	if total > 0 {
		successRate = int(math.Round(float64(successful) / float64(total) * 100))
	}

	// DISCORD API DEL //

	var discordUser *spec.SsmDiscordUser
	if user.DiscordID.Valid {
		discordUserReq := &spec.GetDiscordUserPayload{
			DiscordID: user.DiscordID.String,
		}
		discordUser, err = s.GetDiscordUser(ctx, discordUserReq)
		if err != nil {
			s.log.Warn("could not get discord user info", zap.Error(err), utils.C(ctx))
		}
	}

	result := &spec.SsmAdminUserdetails{
		ID:          user.ID,
		Email:       user.Email,
		FullName:    user.FullName,
		Role:        user.Role,
		SchoolID:    user.SchoolID.Ptr(),
		DiscordID:   user.DiscordID.Ptr(),
		DiscordUser: discordUser,
		SubmissionStats: &spec.SubmissionStats{
			Successful:  successful,
			Failed:      failed,
			Total:       total,
			SuccessRate: successRate,
		},
		HourlyActivity:       hourlyActivity,
		ChallengeSubmissions: challengeSubmissions,
	}

	return result, nil
}

func (s *service) UpdateUserRole(ctx context.Context, req *spec.UpdateUserRolePayload) error {
	// Check if user exists
	user, err := models.Users(models.UserWhere.ID.EQ(req.UserID)).One(ctx, s.db)
	if err != nil {
		if err == sql.ErrNoRows {
			return spec.MakeNotFound(fmt.Errorf("user not found"))
		}
		s.log.Error("could not get user", zap.Error(err), utils.C(ctx))
		return err
	}

	// Validate role (you might want to add validation for allowed roles)
	validRoles := []string{"solver", "author", "org", "admin"} // Adjust based on your system's roles
	isValidRole := false
	for _, validRole := range validRoles {
		if req.Role == validRole {
			isValidRole = true
			break
		}
	}
	if !isValidRole {
		return spec.MakeBadRequest(fmt.Errorf("invalid role: %s", req.Role))
	}

	// Update the user's role
	user.Role = req.Role
	_, err = user.Update(ctx, s.db, boil.Infer())
	if err != nil {
		s.log.Error("could not update user role", zap.Error(err), utils.C(ctx))
		return err
	}

	s.log.Info("user role updated successfully",
		zap.String("user_id", req.UserID),
		zap.String("new_role", req.Role),
		utils.C(ctx))

	return nil
}

func (s *service) DeleteUserSolve(ctx context.Context, req *spec.DeleteUserSolvePayload) error {
	n, err := s.deleteUserSolves(ctx, req.UserID, &req.ChallengeID)
	if err != nil {
		return err
	}
	if n == 0 {
		return spec.MakeNotFound(fmt.Errorf("user has not solved this challenge"))
	}

	s.log.Info("user solve removed",
		zap.String("user_id", req.UserID),
		zap.String("challenge_id", req.ChallengeID),
		utils.C(ctx))

	return nil
}

func (s *service) DeleteUserSolves(ctx context.Context, req *spec.DeleteUserSolvesPayload) error {
	n, err := s.deleteUserSolves(ctx, req.UserID, nil)
	if err != nil {
		return err
	}

	s.log.Info("all user solves removed",
		zap.String("user_id", req.UserID),
		zap.Int64("solves", n),
		utils.C(ctx))

	return nil
}

// tar bort user_solves och school_solves, för en chall eller alla om challengeID är nil
func (s *service) deleteUserSolves(ctx context.Context, userID string, challengeID *string) (int64, error) {
	if !auth.HasRole(ctx, "admin") {
		return 0, spec.MakeUnauthorized(errors.New("only admins can remove solves"))
	}

	exists, err := models.Users(models.UserWhere.ID.EQ(userID)).Exists(ctx, s.db)
	if err != nil {
		s.log.Error("could not check user exists", zap.Error(err), utils.C(ctx))
		return 0, err
	}
	if !exists {
		return 0, spec.MakeNotFound(fmt.Errorf("user not found"))
	}

	tx, err := s.db.BeginTx(ctx, &sql.TxOptions{})
	if err != nil {
		return 0, err
	}
	defer tx.Rollback() //nolint:errcheck

	userMods := []qm.QueryMod{models.UserSolfWhere.UserID.EQ(userID)}
	schoolMods := []qm.QueryMod{models.SchoolSolfWhere.UserID.EQ(userID)}
	if challengeID != nil {
		userMods = append(userMods, models.UserSolfWhere.ChallengeID.EQ(*challengeID))
		schoolMods = append(schoolMods, models.SchoolSolfWhere.ChallengeID.EQ(*challengeID))
	}

	n, err := models.UserSolves(userMods...).DeleteAll(ctx, tx)
	if err != nil {
		s.log.Error("could not delete user solves", zap.Error(err), utils.C(ctx))
		return 0, err
	}

	_, err = models.SchoolSolves(schoolMods...).DeleteAll(ctx, tx)
	if err != nil {
		s.log.Error("could not delete school solves", zap.Error(err), utils.C(ctx))
		return 0, err
	}

	if err := tx.Commit(); err != nil {
		s.log.Error("could not commit", zap.Error(err), utils.C(ctx))
		return 0, err
	}

	return n, nil
}
