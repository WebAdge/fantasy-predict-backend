/** @format */

import { Router } from "express"

import { applicationInReview, competitionLeaderboard, create, leaderboard, sendPredictionMail } from "./controller"
import { validator } from "../../common/utils"
import { competitionLeaderboardSchema, createSchema, inReviewSchema, leaderboardSchema, sendMailSchema } from "./validation"
import { validateCreate } from "./middleware"

const predictionRouter = Router({
    caseSensitive: true,
    strict: true,
})

predictionRouter.post("/", validator.body(createSchema), validateCreate, create)

predictionRouter.get("/", validator.query(leaderboardSchema), leaderboard);
predictionRouter.post("/send-mail", validator.body(sendMailSchema), sendPredictionMail);
predictionRouter.get("/comp-leaderboard", validator.query(competitionLeaderboardSchema), competitionLeaderboard);
predictionRouter.get("/in-review", validator.query(inReviewSchema), applicationInReview);

export default predictionRouter
