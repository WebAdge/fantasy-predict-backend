/** @format */

import { z } from "zod"

export const createSchema = z
    .object({
        match: z.string({ required_error: "Enter Match" }).nonempty(),
        competition: z.string({ required_error: "Enter Competition" }).nonempty(),
        outcome: z.string({ required_error: "Enter Outcome" }).nonempty(),
        // z.enum(["draw", "homeWin", "awayWin", "gg", "over1.5", "over2.5", "over3.5", "over4.5"])
    })
    .strict()
