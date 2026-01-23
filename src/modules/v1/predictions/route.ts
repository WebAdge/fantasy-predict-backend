/** @format */

import { Router } from "express"

import { applicationInReview, competitionLeaderboard, create, leaderboard } from "./controller"
import { validator } from "../../common/utils"
import { createSchema } from "./validation"

const predictionRouter = Router({
    caseSensitive: true,
    strict: true,
})

predictionRouter.post("/", validator.body(createSchema), create)

predictionRouter.get("/", leaderboard);
predictionRouter.get("/comp-leaderboard", competitionLeaderboard);
predictionRouter.get("/in-review", applicationInReview);

export default predictionRouter
