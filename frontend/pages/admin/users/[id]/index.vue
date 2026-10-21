<template>
  <div v-if="user && !loading" class="container-fluid">
    <div class="mb-3">
      <button class="btn btn-secondary" @click="navigateTo('/admin/users')">
        ← Back to Users
      </button>
    </div>

    <div class="row">
      <div class="col-md-6">
        <div class="d-flex align-items-center mb-3">
          <img
            v-if="discordAvatarUrl"
            :src="discordAvatarUrl"
            :alt="`${user?.full_name}'s Discord Avatar`"
            class="discord-avatar me-3"
            @error="onAvatarError"
          />
          <div class="avatar-placeholder me-3" v-else-if="user?.discord_id">
            <i class="bi bi-person-circle"></i>
          </div>
          <h1 class="mb-0">{{ user?.full_name }}</h1>
        </div>
        <p><strong>Email:</strong> {{ user?.email }}</p>
        <div class="mb-3">
          <strong>Role:</strong>
          <select
            :value="user?.role"
            @change="updateUserRole(($event.target as HTMLSelectElement).value)"
            class="form-select form-select-sm d-inline-block ms-2"
            style="width: auto"
            :disabled="updatingRole"
          >
            <option value="solver">Solver</option>
            <option value="author">Author</option>
            <option value="org">Org</option>
            <option value="admin">Admin</option>
          </select>
          <span v-if="updatingRole" class="text-muted ms-2">
            <small>Updating...</small>
          </span>
        </div>
        <p v-if="user?.school_id">
          <strong>School:</strong> {{ user?.school_id }}
        </p>
        <div v-if="user?.discord_id" class="mb-4">
          <button class="btn btn-primary" @click="openDiscord" type="button">
            Öppna Discord Profil
          </button>
        </div>
        <div v-if="isAdmin" class="mb-4">
          <button
            class="btn btn-danger"
            type="button"
            :disabled="removingSolves || solvedCount === 0"
            @click="removeAllSolves"
          >
            Remove all solves ({{ solvedCount }})
          </button>
        </div>
      </div>
      <div class="col-md-6 d-flex justify-content-end gap-4">
        <div v-if="submissionStats.total > 0" class="text-center">
          <div class="position-relative d-inline-block">
            <svg width="120" height="120" class="bg-success-chart">
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="#e9ecef"
                stroke-width="8"
              />
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="rgb(var(--bs-success-rgb))"
                stroke-width="8"
                stroke-linecap="round"
                :stroke-dasharray="successCircumference"
                :stroke-dashoffset="successOffset"
                transform="rotate(-90 60 60)"
              />
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="rgb(var(--bs-danger-rgb))"
                stroke-width="8"
                stroke-linecap="round"
                :stroke-dasharray="failureCircumference"
                :stroke-dashoffset="failureOffset"
                transform="rotate(-90 60 60)"
              />
            </svg>
            <div class="position-absolute top-50 start-50 translate-middle">
              <div class="fw-bold">{{ submissionStats.success_rate }}%</div>
              <small class="text-muted">Success</small>
            </div>
          </div>
          <div class="mt-2">
            <div class="d-flex justify-content-center gap-3">
              <div class="d-flex align-items-center">
                <div
                  class="bg-success"
                  style="
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    margin-right: 4px;
                  "
                ></div>
                <small>Correct: {{ submissionStats.successful }}</small>
              </div>
              <div class="d-flex align-items-center">
                <div
                  class="bg-danger"
                  style="
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    margin-right: 4px;
                  "
                ></div>
                <small>Wrong: {{ submissionStats.failed }}</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="submissionStats.total > 0" class="mb-5">
      <div class="card">
        <div class="card-body">
          <h5 class="card-title text-center mb-4">Activity by Hour</h5>
          <div
            class="activity-chart-large d-flex align-items-end justify-content-center"
          >
            <div
              v-for="(count, hour) in hourlyActivity"
              :key="hour"
              class="activity-bar-large d-flex flex-column align-items-center"
            >
              <div
                class="bar-large bg-primary"
                :style="{ height: getBarHeightLarge(hour) + 'px' }"
                :title="`${hour}:00 - ${count} submissions`"
              ></div>
              <small class="hour-label-large">{{
                hour.toString().padStart(2, "0")
              }}</small>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-for="challenge in challengeSubmissions"
      :key="challenge.challenge_id"
      class="mb-5 challenge-section"
    >
      <div class="d-flex align-items-center gap-3 flex-wrap">
        <h1 class="mb-0">{{ challenge.challenge_title }}</h1>
        <span v-if="challenge.solved" class="badge bg-success">Solved</span>
        <button
          v-if="isAdmin && challenge.solved"
          class="btn btn-sm btn-outline-danger"
          type="button"
          :disabled="removingSolves"
          @click="removeSolve(challenge)"
        >
          Remove solve
        </button>
      </div>
      <div>
        <div class="table-responsive">
          <table v-if="challenge.submissions.length" class="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Input</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="submission in challenge.submissions"
                :key="submission.id"
              >
                <td class="text-break">{{ user?.email }}</td>
                <td
                  :class="{
                    'bg-success': submission.successful,
                    'bg-danger': !submission.successful,
                  }"
                  class="text-break"
                >
                  {{ submission.input }}
                </td>
                <td>
                  {{
                    new Date(submission.submitted_at * 1000)
                      .toString()
                      .split(" (")[0]
                  }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div v-if="challengeSubmissions.length === 0">
      <h1>Challenge Submissions</h1>
      <p>Inga Challenge sumbissions hittade för denna användare.</p>
    </div>
  </div>
  <div v-else-if="!user" class="container">
    <div class="alert alert-warning">
      <h4>User Not Found</h4>
      <p>The user with ID "{{ userId }}" could not be found.</p>
      <button class="btn btn-secondary" @click="navigateTo('/admin/users')">
        ← Back to Users
      </button>
    </div>
  </div>
  <div v-else-if="loading" class="container">
    <p>Loading user data and challenge submissions...</p>
    <div class="spinner-border" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import { useAuthStore } from "~/store/auth";

const http = useHttp();
const route = useRoute();
const authStore = useAuthStore();

const userId = route.params.id as string;
const userDetails = ref<any>(null);
const basicUserInfo = ref<any>(null);
const loading = ref(true);
const avatarError = ref(false);
const updatingRole = ref(false);
const removingSolves = ref(false);

// backend only lets admins remove solves
const isAdmin = computed(() => authStore.user?.role === "admin");

const user = computed(() => ({
  // Basic info from users API
  full_name: basicUserInfo.value?.full_name,
  email: basicUserInfo.value?.email,
  role: basicUserInfo.value?.role,
  discord_id: basicUserInfo.value?.discord_id,
  discord_user: basicUserInfo.value?.discord_user,
  // Everything else from details API
  ...userDetails.value,
}));

// discord avatar
const discordAvatarUrl = computed(() => {
  if (!user.value?.discord_id) {
    return null;
  }

  const discordId = user.value.discord_id;
  if (user.value.discord_user?.avatar && !avatarError.value) {
    const format = user.value.discord_user.avatar.startsWith("a_")
      ? "gif"
      : "png";
    return `https://cdn.discordapp.com/avatars/${discordId}/${user.value.discord_user.avatar}.${format}?size=128`;
  }

  const defaultAvatarNumber = Math.abs((parseInt(discordId) >> 22) % 6);
  return `https://cdn.discordapp.com/embed/avatars/${defaultAvatarNumber}.png`;
});

const onAvatarError = () => {
  avatarError.value = true;
};

const challengeSubmissions = computed(() => {
  return userDetails.value?.challenge_submissions || [];
});

const solvedCount = computed(() => {
  return challengeSubmissions.value.filter((c: any) => c.solved).length;
});

const submissionStats = computed(() => {
  return (
    userDetails.value?.submission_stats || {
      successful: 0,
      failed: 0,
      total: 0,
      success_rate: 0,
    }
  );
});
// math go brr
const radius = 50;
const circumference = 2 * Math.PI * radius;

const successCircumference = computed(() => {
  const percentage =
    submissionStats.value.total > 0
      ? submissionStats.value.successful / submissionStats.value.total
      : 0;
  return `${percentage * circumference} ${circumference}`;
});

const successOffset = computed(() => {
  return 0;
});

const failureCircumference = computed(() => {
  const percentage =
    submissionStats.value.total > 0
      ? submissionStats.value.failed / submissionStats.value.total
      : 0;
  return `${percentage * circumference} ${circumference}`;
});

const failureOffset = computed(() => {
  const successPercentage =
    submissionStats.value.total > 0
      ? submissionStats.value.successful / submissionStats.value.total
      : 0;
  return -(successPercentage * circumference);
});

const hourlyActivity = computed(() => {
  return userDetails.value?.hourly_activity || Array(24).fill(0);
});

const maxHourlyActivity = computed(() => {
  return Math.max(...hourlyActivity.value, 1);
});

const getBarHeight = (hour: number) => {
  const maxHeight = 40;
  const count = hourlyActivity.value[hour];
  return Math.max(2, (count / maxHourlyActivity.value) * maxHeight);
};

const getBarHeightLarge = (hour: number) => {
  const maxHeight = 200;
  const count = hourlyActivity.value[hour];
  return Math.max(4, (count / maxHourlyActivity.value) * maxHeight);
};

const openDiscord = () => {
  if (user.value?.discord_id) {
    const discordUrl = `https://discord.com/users/${user.value.discord_id}`;
    window.open(discordUrl, "_blank");
  }
};

const fetchBasicUserInfo = async () => {
  try {
    const response = await http(`/admin/users`);
    const users = response || [];

    const foundUser = users.find((u: any) => u.id === userId);
    if (foundUser) {
      basicUserInfo.value = {
        full_name: foundUser.full_name,
        email: foundUser.email,
        role: foundUser.role,
        discord_id: foundUser.discord_id,
        discord_user: foundUser.discord_user,
      };
    }
  } catch (error) {
    console.error(`Failed to load basic user info for ${userId}:`, error);
    basicUserInfo.value = null;
  }
};

const updateUserRole = async (newRole: string) => {
  try {
    updatingRole.value = true;

    // Update role via API
    await http(`/admin/users/${userId}/role`, {
      method: "PATCH",
      body: {
        role: newRole,
      },
    });

    // Update local state
    if (basicUserInfo.value) {
      basicUserInfo.value.role = newRole;
    }

    console.log("User role updated successfully");
  } catch (error) {
    console.error("Failed to update user role:", error);
    alert("Failed to update user role. Please try again.");

    // Revert the dropdown to the original value by refetching
    await fetchBasicUserInfo();
  } finally {
    updatingRole.value = false;
  }
};

const fetchUserDetails = async () => {
  userDetails.value = await http(`/admin/users/${userId}/details`);
};

const removeSolve = async (challenge: any) => {
  if (
    !confirm(
      `Remove ${user.value?.full_name}'s solve of "${challenge.challenge_title}"?`
    )
  )
    return;

  try {
    removingSolves.value = true;
    await http(`/admin/users/${userId}/solves/${challenge.challenge_id}`, {
      method: "DELETE",
    });
    await fetchUserDetails();
  } catch (error) {
    console.error("Failed to remove solve:", error);
    alert("Failed to remove solve. Please try again.");
  } finally {
    removingSolves.value = false;
  }
};

const removeAllSolves = async () => {
  if (
    !confirm(
      `Remove ALL solves for ${user.value?.full_name}? This cannot be undone.`
    )
  )
    return;

  try {
    removingSolves.value = true;
    await http(`/admin/users/${userId}/solves`, { method: "DELETE" });
    await fetchUserDetails();
  } catch (error) {
    console.error("Failed to remove solves:", error);
    alert("Failed to remove solves. Please try again.");
  } finally {
    removingSolves.value = false;
  }
};

onMounted(async () => {
  try {
    loading.value = true;

    const [basicInfoPromise, detailsPromise] = await Promise.allSettled([
      fetchBasicUserInfo(),
      http(`/admin/users/${userId}/details`),
    ]);

    if (detailsPromise.status === "fulfilled") {
      userDetails.value = detailsPromise.value;
    } else {
      console.error(
        `Failed to load user details for ${userId}:`,
        detailsPromise.reason
      );
      userDetails.value = null;
    }
  } catch (error) {
    console.error(`Failed to load user data for ${userId}:`, error);
    userDetails.value = null;
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.discord-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 2px solid #ffab1c;
  object-fit: cover;
  box-shadow: 0 2px 8px rgba(88, 101, 242, 0.2);
  transition: all 0.3s ease;
}

.discord-avatar:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 16px rgba(88, 101, 242, 0.4);
}

.avatar-placeholder {
  width: 75px;
  height: 75px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border: 3px solid #dee2e6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 35px;
  color: #6c757d;
  transition: all 0.3s ease;
}

.avatar-placeholder:hover {
  background: linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%);
  transform: scale(1.05);
}

.challenge-section {
  border-left: 4px solid #ffc107;
  padding-left: 1rem;
  margin-left: 0.5rem;
}

.success-chart {
  transform: rotate(-90deg);
}

.success-chart circle {
  transition: stroke-dasharray 0.5s ease-in-out,
    stroke-dashoffset 0.5s ease-in-out;
}

.position-relative .position-absolute {
  z-index: 10;
}

.activity-chart {
  height: 60px;
  padding: 10px 5px;
}

.activity-bar {
  min-height: 50px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
}

.bar {
  width: 8px;
  background-color: #ffc107 !important;
  border-radius: 2px;
  transition: background-color 0.2s ease;
  cursor: pointer;
}

.bar:hover {
  background-color: #ffc107 !important;
}

.hour-label {
  font-size: 10px;
  color: #6c757d;
  margin-top: 2px;
  line-height: 1;
}

.activity-chart-large {
  height: 250px;
  padding: 20px 10px;
  gap: 4px;
  overflow-x: auto;
  min-width: 100%;
}

.activity-bar-large {
  min-height: 230px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  flex: 1;
  min-width: 25px;
}

.bar-large {
  width: 18px;
  background-color: #ffc107 !important;
  border-radius: 3px;
  transition: all 0.3s ease;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.bar-large:hover {
  background-color: #ffc107 !important;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.hour-label-large {
  font-size: 11px;
  color: #6c757d;
  margin-top: 8px;
  line-height: 1;
  font-weight: 500;
}

/* animations oOoOOo */
@media (max-width: 768px) {
  .activity-chart-large {
    height: 200px;
    padding: 15px 5px;
    gap: 2px;
  }

  .activity-bar-large {
    min-height: 180px;
    min-width: 20px;
  }

  .bar-large {
    width: 14px;
  }

  .hour-label-large {
    font-size: 10px;
    margin-top: 6px;
  }
}

.form-select-sm {
  font-size: 0.875rem;
  padding: 0.25rem 0.5rem;
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  min-width: 120px;
  cursor: pointer;
}

.form-select-sm:focus {
  border-color: #86b7fe;
  outline: 0;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

.form-select-sm:disabled {
  background-color: #e9ecef;
  opacity: 1;
}
</style>
