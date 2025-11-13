/** @format */

import { Router } from "express"

import { get, initializeSarepayPayment, securePayment, verifyTransaction } from "./controller"
import { Authenticate } from "../../common/utils"

const walletRouter = Router({
    caseSensitive: true,
    strict: true,
})

walletRouter.get("/", Authenticate, get)
walletRouter.get("/pay", securePayment)
walletRouter.post("/", Authenticate, initializeSarepayPayment)
walletRouter.post("/verify-payment", verifyTransaction)

export default walletRouter
