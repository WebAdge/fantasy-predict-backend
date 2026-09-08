/** @format */

import { z } from "zod"

export const createSchema = z
    .object({
        match: z.string({ required_error: "Enter Match" }).nonempty(),
        pool: z.string().optional(),
        competition: z.string({ required_error: "Enter Competition" }).nonempty(),
        outcome: z.string({ required_error: "Enter Outcome" }).nonempty(),
        // z.enum(["draw", "homeWin", "awayWin", "gg", "over1.5", "over2.5", "over3.5", "over4.5"])
    })
    .strict()

export const leaderboardSchema = z
    .object({
        competition: z.string().optional(),
        pool: z.string().optional(),
        fromDate: z.string().optional(),
        toDate: z.string().optional(),
    })
    .strict()

export const inReviewSchema = z
    .object({
        competition: z.string().optional(),
        poolId: z.string().optional(),
        fromDate: z.string().optional(),
        toDate: z.string().optional(),
    })
    .strict()

export const competitionLeaderboardSchema = z
    .object({
        competition: z.string({ required_error: "Enter Competition" }).nonempty(),
    })
    .strict()

export const sendMailSchema = z
    .object({
        matchday: z.string({ required_error: "Enter Matchday" }).nonempty(),
        competition: z.string({ required_error: "Enter Competition" }).nonempty(),
    })
    .strict()
