/** @format */

import { Router } from "express"

import { fetchSchema } from "./validation"
import { fetch } from "./controller"
import { validator } from "../../common/utils"

const memberRouter = Router({
    caseSensitive: true,
    strict: true,
})

memberRouter.get("/", validator.query(fetchSchema), fetch)

export default memberRouter
