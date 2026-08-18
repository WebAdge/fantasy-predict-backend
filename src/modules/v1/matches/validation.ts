/** @format */

import { z } from "zod"

export const fetchSchema = z
    .object({
        competition: z
            .string({ required_error: "Enter competition" })
            .nonempty(),
        stage: z.string().optional(),
        status: z.string().optional(),
        matchday: z.string().optional(),
        date: z.string().optional(),
    })
    .strict()

export const fetchByMatchdaySchema = z
    .object({
        matchday: z.string({ required_error: "Enter matchday" }).nonempty(),
        competition: z.string({ required_error: "Enter competition" }).nonempty(),
    })
    .strict()

export const fetchScoreSchema = z
    .object({
        competition: z.string({ required_error: "Enter competition" }).nonempty(),
    })
    .strict()
