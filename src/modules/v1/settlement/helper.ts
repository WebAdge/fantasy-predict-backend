/** @format */

import { catchError, tryPromise } from "../../common/utils"
import WalletService from "../wallets/service"
import SettlementService from "./service"

export const processSettlement = async (id: string) => {
    const [settlement, error] = await tryPromise(
        new SettlementService({
            _id: id,
            status: "pending",
        }).findOne()
    )

    if (error) throw catchError(`Error processing request`, 404)
    if (!settlement) throw catchError(`${id} is not available`, 400)

    // const amount = Number(settlement.meta.amount)
    const [wallet, wErr] = await tryPromise(
        new WalletService({
            accountNumber: settlement.meta.recipient,
        }).findOne()
    )

    if (wErr) throw catchError(`Error processing request`, 404)
    if (!wallet) throw catchError(`Wallet not found`, 400)
    // find destination of account
    // convert transaction amount to number
    //
    // const trans = await db.sequelize.transaction({
    //     autocommit: false,
    //     isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE,
    //     type: Transaction.TYPES.EXCLUSIVE,
    // })
    // await new WalletTransaction().Credit(
    //     {
    //         walletId: String(wallet.id),
    //         settlementId: String(settlement.id),
    //         amount,
    //         source: {
                
    //             accountName:
    //                 settlement.meta.transactions[0].accountDetails.accountName,
    //             accountNumber:
    //                 settlement.meta.transactions[0].accountDetails
    //                     .accountNumber,
    //             bankCode:
    //                 settlement.meta.transactions[0].accountDetails.bankCode,
    //         },
    //     },
    //     trans
    // )
}
