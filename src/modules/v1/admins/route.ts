/** @format */

import { Router } from "express"

import { createSchema, fetchSchema, loginSchema, verifySchema } from "./validation"
import { update, create, fetch, login, profile, remove, dashboard } from "./controller"
import { Authenticate, validator } from "../../common/utils"

const adminRouter = Router({
    caseSensitive: true,
    strict: true,
})

adminRouter.post(
    "/",
    Authenticate,
    validator.body(createSchema),
    create
)

adminRouter.post(
    "/verify-account",
    validator.body(verifySchema),
    update
)

adminRouter.post(
    "/login",
    validator.body(loginSchema),
    login
)

adminRouter.get(
    "/profile",
    Authenticate,
    profile
)

adminRouter.get(
    "/dashboard",
    Authenticate,
    dashboard
)

adminRouter.delete(
    "/profile",
    Authenticate,
    remove
)

adminRouter.get(
    "/",
    Authenticate,
    validator.body(fetchSchema), 
    fetch
)

export default adminRouter
