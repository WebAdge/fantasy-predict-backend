/** @format */

import { IContest } from "../../../types"
import { ContestModel } from "../../../databases"
import BaseRepository from "../../common/repositories/BaseRepository"
import { FilterQuery } from "mongoose"

class ContestService extends BaseRepository<IContest> {
    constructor(params: Partial<IContest> | FilterQuery<IContest>) {
        super(ContestModel, params)
    }
}

export default ContestService
