package goa

import . "goa.design/goa/v3/dsl"

var _ = Service("admin", func() {
	Error("unauthorized")
	Error("not_found")
	Error("bad_request")
	HTTP(func() {
		Response("unauthorized", StatusForbidden, func() {
			Description("When the user does not have the required role")
		})
		Response("not_found", StatusNotFound, func() {
			Description("Resource not found")
		})
		Response("bad_request", StatusBadRequest, func() {
			Description("Resource not found")
		})

		Path("/admin")
	})
	Security(JWTAuth)

	Method("ListChallenges", func() {
		Payload(func() {
			Extend(TokenPayload)
		})
		Result(CollectionOf(ResultAdminChallenge))
		HTTP(func() {
			GET("/challenges")
			Response(StatusOK)
		})
	})

	Method("GetChallengeMeta", func() {
		Payload(func() {
			Extend(TokenPayload)
			Extend(ChallengeIDArtifact)
		})
		Result(ChallengeMeta)
		HTTP(func() {
			GET("/challenges/{challenge_id}")
			Response(StatusOK)
		})
	})

	Method("CreateChallenge", func() {
		Payload(func() {
			Extend(CreateChallengePayload)
			Extend(TokenPayload)
		})
		HTTP(func() {
			POST("/challenges")
			Response(StatusCreated)
		})
	})

	Method("PresignChallFileUpload", func() {
		Payload(func() {
			Extend(TokenPayload)
			Extend(ChallengeIDArtifact)
			Attribute("md5", String, "MD5 hash of the file content in base64", func() {
				Example("cq02dBbcuugBHM1oKyvMlQ==")
			})
			Attribute("filename", String, func() {
				Example("decryptor.exe")
			})
			Attribute("size", Int64, func() {
				Example(41239)
				Description("the files number of bytes")
			})
			Required("md5", "filename", "size")
		})
		Result(func() {
			Attribute("url", String, "Signed PutObject URL ", func() {
				Example("https://s3-endpoint.example/bucket/key?signature=xxx")
			})
			Required("url")
		})
		HTTP(func() {
			POST("/challenges/{challenge_id}/file_url")
			Response(StatusOK)
		})
	})

	Method("ListMonthlyChallenges", func() {
		Payload(func() {
			Extend(TokenPayload)
		})
		Result(ArrayOf(MonthlyChallenge))
		HTTP(func() {
			GET("/monthly_challenges")
		})
	})

	Method("DeleteMonthlyChallenge", func() {
		Payload(func() {
			Extend(TokenPayload)
			Extend(ChallengeIDArtifact)
		})
		HTTP(func() {
			DELETE("/monthly_challenges/{challenge_id}")
		})
	})

	Method("DeleteFile", func() {
		Payload(func() {
			Extend(TokenPayload)
			Extend(FileIDArtifact)
		})
		HTTP(func() {
			DELETE("/files/{fileID}")
		})
	})

	Method("CreateMonthlyChallenge", func() {
		Payload(func() {
			Extend(TokenPayload)
			Extend(MonthlyChallenge)
		})
		HTTP(func() {
			POST("/monthly_challenges")
		})
	})

	Method("ListUsers", func() {
		Payload(func() {
			Extend(TokenPayload)
		})
		Result(ArrayOf(User))
		HTTP(func() {
			GET("/users")
		})
	})

	Method("GetDiscordUser", func() {
		Description("get discord avatar for person")
		Payload(func() {
			Extend(TokenPayload)
			Attribute("discord_id", String, "Discord user ID")
			Required("discord_id")
		})
		Result(DiscordUser)
		HTTP(func() {
			GET("/users/discord/{discord_id}")
			Response(StatusOK)
		})
	})

	Method("ListAuthors", func() {
		Payload(func() {
			Extend(TokenPayload)
		})
		Result(ArrayOf(Author))
		HTTP(func() {
			GET("/authors")
		})
	})

	Method("UpdateAuthor", func() {
		Payload(func() {
			Extend(TokenPayload)
			Extend(Author)
		})
		HTTP(func() {
			PUT("/authors/{id}")
		})
	})
	Method("CreateAuthor", func() {
		Payload(func() {
			Extend(TokenPayload)
			Extend(CreateAuthorPayload)
		})
		HTTP(func() {
			POST("/authors")
		})
	})

	Method("DeleteAuthor", func() {
		Payload(func() {
			Extend(TokenPayload)
			Attribute("id", String, func() {
				Example("8b141111-84d6-4c82-936e-86b45e52d456")
			})
			Required("id")
		})
		HTTP(func() {
			DELETE("/authors/{id}")
		})
	})

	Method("AddFlag", func() {
		Payload(func() {
			Extend(TokenPayload)
			Attribute("flag", String, func() {
				Example("SSM{...}")
			})
			Extend(ChallengeIDArtifact)
			Required("flag")
		})

		HTTP(func() {
			POST("/challenges/{challenge_id}/flags")
		})
	})

	Method("DeleteFlag", func() {
		Payload(func() {
			Extend(TokenPayload)
			Attribute("flagID", String, func() {
				Example("ac1c4362-c121-45a3-9745-8f8160a55f96")
				Format(FormatUUID)
			})
			Extend(ChallengeIDArtifact)
			Required("flagID")
		})

		HTTP(func() {
			DELETE("/challenges/{challenge_id}/flags/{flagID}")
		})
	})

	Method("ListCategories", func() {
		Result(ArrayOf(Category))
		Payload(func() {
			Extend(TokenPayload)
		})
		HTTP(func() {
			GET("/categories")
		})
	})

	Method("ChalltoolsImport", func() {
		Payload(func() {
			Extend(ChallImport)
			Attribute("import_token", String, func() {
				Example("ctfimp_7ad44accdcca4c5ea10ea7ea61bec01b_efc6066f6ca0c6cd")
			})
			Required("import_token")
		})
		NoSecurity()
		HTTP(func() {
			POST("/push_challenge")
			Header("import_token:X-API-Key", String, "Auth token")
			Response(StatusOK)
		})
	})

	Method("ListCTFEvents", func() {
		Payload(func() {
			Extend(TokenPayload)
		})
		Result(ArrayOf(CTFEvent))
		HTTP(func() {
			GET("/events")
		})
	})

	Method("CreateCTFEvent", func() {
		Payload(func() {
			Extend(TokenPayload)
			Reference(CTFEvent)
			Attribute("name")
		})
		HTTP(func() {
			POST("/events")
		})
	})

	Method("DeleteCTFEvent", func() {
		Payload(func() {
			Extend(TokenPayload)
			Reference(CTFEvent)
			Attribute("id")
		})
		HTTP(func() {
			DELETE("/events/{id}")
		})
	})

	Method("CreateCTFEventImportToken", func() {
		Payload(func() {
			Extend(TokenPayload)
			Attribute("name", String, func() {
				Example("e3bb4dc5-9479-42ce-aed3-b41e8139fccb")
			})
			Attribute("expires_in", String, func() {
				Enum("hour", "week", "year")
			})
			Required("name", "expires_in")
		})
		Result(func() {
			Attribute("token")
			Required("token")
		})
		HTTP(func() {
			POST("/import_token")
		})
	})

	Method("ListCourses", func() {
		Result(CollectionOf(AdminCourse))
		Payload(func() {
			Extend(TokenPayload)
		})
		HTTP(func() {
			GET("/courses")
			Response(StatusOK)
		})
	})
	Method("CreateCourse", func() {
		Payload(func() {
			Extend(TokenPayload)
			Extend(CreateCoursePayload)
		})
		HTTP(func() {
			POST("/courses")
			Response(StatusOK)
		})
	})
	Method("UpdateCourse", func() {
		Payload(func() {
			Extend(TokenPayload)
			Extend(CreateCoursePayload)
			Extend(IDArtifact)
		})
		HTTP(func() {
			PUT("/courses/{id}")
			Response(StatusOK)
		})
	})

	Method("CreateCTF", func() {
		Payload(func() {
			Extend(TokenPayload)
			Extend(CTFCreate)
		})
		Result(CTF)
		HTTP(func() {
			POST("/ctfs")
			Response(StatusCreated)
		})
	})
	Method("UpdateCTF", func() {
		Payload(func() {
			Extend(TokenPayload)
			Extend(IDArtifact)
			Extend(CTFUpdate)
		})
		Result(CTF)
		HTTP(func() {
			PUT("/ctfs/{id}")
			Response(StatusOK)
		})
	})
	Method("DeleteCTF", func() {
		Payload(func() {
			Extend(TokenPayload)
			Extend(IDArtifact)
		})
		HTTP(func() {
			DELETE("/ctfs/{id}")
			Response(StatusOK)
		})
	})
	Method("ListCTFs", func() {
		Payload(func() {
			Extend(TokenPayload)
		})
		Result(ArrayOf(CTF))
		HTTP(func() {
			GET("/ctfs")
			Response(StatusOK)
		})
	})
	Method("AdminScoreboard", func() {
		Description("Visa scoreboard som bypassar freeze")
		Payload(func() {
			Extend(TokenPayload)
			Attribute("slug", String, "CTF slug")
			Required("slug")
		})
		Result(ArrayOf(CTFScore))
		HTTP(func() {
			GET("/ctfs/{slug}/scoreboard")
			Response(StatusOK)
		})
	})
	Method("CreateChallengeGroup", func() {
		Payload(func() {
			Extend(TokenPayload)
			Extend(CreateChallengeGroup)
		})
		Result(ChallengeGroup)
		HTTP(func() {
			POST("/challenge_groups")
			Response(StatusCreated)
		})
	})
	Method("UpdateChallengeGroup", func() {
		Payload(func() {
			Extend(TokenPayload)
			Extend(IDArtifact)
			Extend(UpdateChallengeGroup)
		})
		Result(ChallengeGroup)
		HTTP(func() {
			PUT("/challenge_groups/{id}")
			Response(StatusOK)
		})
	})
	Method("DeleteChallengeGroup", func() {
		Payload(func() {
			Extend(TokenPayload)
			Extend(IDArtifact)
		})
		HTTP(func() {
			DELETE("/challenge_groups/{id}")
			Response(StatusOK)
		})
	})
	Method("ListChallengeGroups", func() {
		Payload(func() {
			Extend(TokenPayload)
		})
		Result(ArrayOf(ChallengeGroup))
		HTTP(func() {
			GET("/challenge_groups")
			Response(StatusOK)
		})
	})
	Method("ListCTFUsers", func() {
		Payload(func() {
			Attribute("ctf_id", String)
			Required("ctf_id")
			Extend(TokenPayload)
		})
		Result(ArrayOf(CTFUser))
		HTTP(func() {
			GET("/ctfs/{ctf_id}/users")
			Response(StatusOK)
		})
	})
	Method("DeleteCTFUser", func() {
		Payload(func() {
			Attribute("ctf_id", String)
			Attribute("user_id", String)
			Required("ctf_id", "user_id")
			Extend(TokenPayload)
		})
		HTTP(func() {
			DELETE("/ctfs/{ctf_id}/users/{user_id}")
			Response(StatusOK)
		})
	})
	Method("UpdateCTFUser", func() {
		Payload(func() {
			Attribute("ctf_id", String)
			Attribute("user_id", String)
			Attribute("username", String)
			Required("ctf_id", "user_id", "username")
			Extend(TokenPayload)
		})
		Result(CTFUser)
		HTTP(func() {
			PATCH("/ctfs/{ctf_id}/users/{user_id}")
			Response(StatusOK)
		})
	})

	Method("ListCTFTeams", func() {
		Payload(func() {
			Attribute("ctf_id", String)
			Required("ctf_id")
			Extend(TokenPayload)
		})
		Result(ArrayOf(CTFTeam))
		HTTP(func() {
			GET("/ctfs/{ctf_id}/teams")
			Response(StatusOK)
		})
	})
	Method("CreateCTFTeam", func() {
		Payload(func() {
			Attribute("ctf_id", String)
			Attribute("teamname", String)
			Required("ctf_id", "teamname")
			Extend(TokenPayload)
		})
		Result(CTFTeam)
		HTTP(func() {
			POST("/ctfs/{ctf_id}/teams")
			Response(StatusCreated)
		})
	})
	Method("DeleteCTFTeam", func() {
		Payload(func() {
			Attribute("ctf_id", String)
			Attribute("team_id", String)
			Required("ctf_id", "team_id")
			Extend(TokenPayload)
		})
		HTTP(func() {
			DELETE("/ctfs/{ctf_id}/teams/{team_id}")
			Response(StatusOK)
		})
	})
	Method("UpdateCTFTeam", func() {
		Payload(func() {
			Attribute("ctf_id", String)
			Attribute("team_id", String)
			Attribute("teamname", String)
			Required("ctf_id", "team_id", "teamname")
			Extend(TokenPayload)
		})
		Result(CTFTeam)
		HTTP(func() {
			PATCH("/ctfs/{ctf_id}/teams/{team_id}")
			Response(StatusOK)
		})
	})
	Method("GetUserDetails", func() {
		Description("Get consolidated user details with all challenge submissions and statistics")
		Payload(func() {
			Extend(TokenPayload)
			Attribute("user_id", String, "User ID")
			Required("user_id")
		})
		Result(UserDetails)
		HTTP(func() {
			GET("/users/{user_id}/details")
			Response(StatusOK)
		})
	})

	Method("UpdateUserRole", func() {
		Description("Update a user's role")
		Payload(func() {
			Extend(TokenPayload)
			Attribute("user_id", String, "User ID")
			Attribute("role", String, "New role for the user")
			Required("user_id", "role")
		})
		HTTP(func() {
			PATCH("/users/{user_id}/role")
			Response(StatusOK)
		})
	})

	Method("DeleteUserSolve", func() {
		Description("Remove a user's solve (and their school's solve) of a wargame challenge")
		Payload(func() {
			Extend(TokenPayload)
			Extend(ChallengeIDArtifact)
			Attribute("user_id", String, "User ID")
			Required("user_id")
		})
		HTTP(func() {
			DELETE("/users/{user_id}/solves/{challenge_id}")
			Response(StatusOK)
		})
	})

	Method("DeleteUserSolves", func() {
		Description("Remove all of a user's wargame solves (and their school's solves)")
		Payload(func() {
			Extend(TokenPayload)
			Attribute("user_id", String, "User ID")
			Required("user_id")
		})
		HTTP(func() {
			DELETE("/users/{user_id}/solves")
			Response(StatusOK)
		})
	})
})
