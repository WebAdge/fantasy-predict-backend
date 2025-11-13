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

export const fetchSchema = z
    .object({
        name: z.string().optional(),
        privacy: z.string().optional(),
        createdBy: z.string().optional(),
        status: z.string().optional(),
        user: z.string().optional(),
        contest: z.string().optional(),
    })
    .strict()
