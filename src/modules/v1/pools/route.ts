/** @format */

import { Router } from "express"

import { createSchema, fetchSchema } from "./validation"
import { create, fetch, get, poolLeaderboar, } from "./controller"
import { validator } from "../../common/utils"
import { validateCreate } from "./middleware"

const poolRouter = Router({
    caseSensitive: true,
    strict: true,
})

poolRouter.post(
    "/",
    validator.body(createSchema),
    validateCreate,
    create
)

poolRouter.get(
    "/",
    validator.query(fetchSchema),
    fetch
)

poolRouter.get(
    "/leadboard/pool",
    poolLeaderboar
)

poolRouter.get(
    "/:id",
    get
)

export default poolRouter
