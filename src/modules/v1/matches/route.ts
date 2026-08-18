/** @format */

import { Router } from "express"

import { fetch, fetchByMatchday, fetchScore } from "./controller"
import { validator } from "../../common/utils"
import { fetchByMatchdaySchema, fetchSchema, fetchScoreSchema } from "./validation"

const matchRouter = Router({
    caseSensitive: true,
    strict: true,
})

matchRouter.get("/", validator.query(fetchSchema), fetch)
matchRouter.get("/matchday", validator.query(fetchByMatchdaySchema), fetchByMatchday)
matchRouter.get("/score", validator.query(fetchScoreSchema), fetchScore)

export default matchRouter
