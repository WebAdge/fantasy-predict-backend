/** @format */

import { z } from "zod"

export const securePaymentSchema = z
    .object({
        email: z
            .string({ required_error: "Enter your email" })
            .email({ message: "Provide a valid email" })
            .nonempty(),
        amount: z.coerce
            .number({ required_error: "Enter amount", invalid_type_error: "Amount must be a number" })
            .positive({ message: "Amount must be greater than 0" }),
    })
    .strict()
