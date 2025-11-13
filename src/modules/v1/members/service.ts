/** @format */

import { IMember } from "../../../types"
import { MemberModel } from "../../../databases"
import BaseRepository from "../../common/repositories/BaseRepository"
import { FilterQuery } from "mongoose"

class MemberService extends BaseRepository<IMember> {
    constructor(params: Partial<IMember> | FilterQuery<IMember>) {
        super(MemberModel, params)
    }
}

export default MemberService
