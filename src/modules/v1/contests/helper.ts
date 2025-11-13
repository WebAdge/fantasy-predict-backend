/** @format */

import { Request } from "express"
import { randomBytes, createHash } from "crypto"
import { createExactMatchRegex } from "../../common/utils"

export const composeFilter = (req: Request) => {
    const { name, createdBy, privacy, search, invitationCode } = req.query
    let filter = {}

    if (search) {
        filter = {
            ...filter,
            $or: [
                { title: createExactMatchRegex(search as string) },
                { invitationCode: search },
            ],
        }
    }
    if (name)
        filter = { ...filter, title: createExactMatchRegex(name as string) }
    if (createdBy) filter = { ...filter, createdBy }
    if (privacy) filter = { ...filter, privacy }
    if (invitationCode) filter = { ...filter, invitationCode }
    filter = { ...filter, endDate: { $gte: new Date().toISOString() } }

    return filter
}

export function generateInviteCode(length = 8) {
    const timestamp = Date.now().toString(36) // base36 timestamp
    const randomStr = randomBytes(4).toString("hex") // 8 random chars
    const hash = createHash("sha256")
        .update(timestamp + randomStr)
        .digest("hex")

    return hash.substring(0, length).toUpperCase() // e.g., "9A1C2B3F"
}
