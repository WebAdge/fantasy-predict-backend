/** @format */

import { Router } from "express"

import { get, initializeSarepayPayment, securePayment, verifyTransaction } from "./controller"
import { Authenticate, validator } from "../../common/utils"
import { securePaymentSchema } from "./validation"

const walletRouter = Router({
    caseSensitive: true,
    strict: true,
})

walletRouter.get("/", Authenticate, get)
walletRouter.get("/pay", validator.query(securePaymentSchema), securePayment)
walletRouter.post("/", Authenticate, initializeSarepayPayment)
walletRouter.post("/verify-payment", verifyTransaction)

export default walletRouter
