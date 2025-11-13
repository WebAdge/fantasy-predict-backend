/** @format */

import { z } from "zod"

export const basicUserValidation = z
    .object({
        email: z
            .string()
            .email({ message: "Provide a valid email" })
            .nonempty({ message: "Enter your email" })
            .trim()
            .toLowerCase(),
        password: z.string().nonempty({ message: "Password cannot be empty" }),
    })
    .required()
    .strict()

export const createSchema = z
    .object({
        title: z
            .string({ required_error: "Enter contest title" })
            .nonempty()
            .toLowerCase(),
        description: z
            .string({ required_error: "Describe your contest" })
            .nonempty(),
        endDate: z.string({ required_error: "Select End Date" }).nonempty(),
        startDate: z.string({ required_error: "Select End Date" }).nonempty(),
        competition: z.string(),
        amount: z.number(),
        winType: z
            .object({
                first: z.number().default(0),
                second: z.number().default(0),
                third: z.number().default(0),
            })
            .required(),
    })
    .strict()

export const joinSchema = z
    .object({
        invitationCode: z.string(),
    })
    .strict()

export const fetchSchema = z
    .object({
        name: z.string().optional(),
        search: z.string().optional(),
        privacy: z.string().optional(),
        createdBy: z.string().optional(),
    })
    .strict()
