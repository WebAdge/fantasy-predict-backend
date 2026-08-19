/** @format */

import { Router } from "express"

import { bvnSchema, changePasswordSchema, createSchema, fetchSchema, loginSchema, notificationSchema, refreshTokenSchema, resendCodeSchema, resetPasswordSchema, updateSchema, verifySchema } from "./validation"
import { update, create, fetch, login, profile, refreshToken, remove, userCount } from "./controller"
import { Authenticate, validator } from "../../common/utils"
import { validateBVN, validateChangePassword, validateCreate, validateForgetPassword, validateResendCode, validateResetPassword, validateSendNotification, verifyAccount } from "./middleware"

const userRouter = Router({
    caseSensitive: true,
    strict: true,
})

userRouter.post(
    "/",
    validator.body(createSchema),
    validateCreate,
    create
)

userRouter.post(
    "/verify-account",
    validator.body(verifySchema),
    verifyAccount,
    update
)

userRouter.post(
    "/send-notification",
    Authenticate,
    validator.body(notificationSchema),
    validateSendNotification,
    update
)

userRouter.patch(
    "/change-password",
    validator.body(changePasswordSchema),
    Authenticate,
    validateChangePassword,
    update
)

userRouter.post(
    "/resend-code",
    validator.body(resendCodeSchema),
    validateResendCode,
    update
)

userRouter.patch(
    "/bvn/:_id",
    validator.body(bvnSchema),
    validateBVN,
    update
)

userRouter.post(
    "/forget-password",
    validator.body(resendCodeSchema),
    validateForgetPassword,
    update
)

userRouter.post(
    "/reset-password",
    validator.body(resetPasswordSchema),
    validateResetPassword,
    update
)

userRouter.post(
    "/login",
    validator.body(loginSchema),
    login
)

userRouter.post(
    "/refresh-token",
    validator.body(refreshTokenSchema),
    refreshToken
)

userRouter.put(
    "/profile",
    Authenticate,
    validator.body(updateSchema),
    update
)

userRouter.get(
    "/profile",
    Authenticate,
    profile
)

userRouter.delete(
    "/profile",
    Authenticate,
    remove
)

userRouter.get("/", validator.body(fetchSchema), fetch)
userRouter.get("/count", Authenticate, userCount)

export default userRouter
