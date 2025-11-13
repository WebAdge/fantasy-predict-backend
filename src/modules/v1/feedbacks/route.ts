/** @format */

import { Router } from "express"

import { fetch, create } from "./controller"

const feedbackRouter = Router({
    caseSensitive: true,
    strict: true,
})

feedbackRouter.get("/", fetch)
feedbackRouter.post("/", create)

export default feedbackRouter
