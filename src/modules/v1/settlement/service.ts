/** @format */

import { SettlementModel } from "../../../databases"
import { ISettlement } from "../../../types"
import BaseRepository from "../../common/repositories/BaseRepository"

class SettlementService extends BaseRepository<ISettlement>{
    constructor(params: Partial<ISettlement>) {
        super(SettlementModel, params)
    }
}

export default SettlementService
