/** @format */

import { Router } from "express"

import { fetch, fetchByMatchday, fetchScore } from "./controller"

const matchRouter = Router({
    caseSensitive: true,
    strict: true,
})

matchRouter.get("/", fetch)
matchRouter.get("/matchday", fetchByMatchday)
matchRouter.get("/score", fetchScore)

export default matchRouter
