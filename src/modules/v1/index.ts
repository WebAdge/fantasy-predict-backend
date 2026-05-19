import { Router } from "express";

import userRouter from "./users/route";
import { Authenticate } from "../common/utils";
import pinRouter from "./pins/route";
import walletRouter from "./wallets/route";
import transactionRouter from "./transactions/route";
import competitionRouter from "./competitions/route";
import matchRouter from "./matches/route";
import predictionRouter from "./predictions/route";
import withdrawalRouter from "./withdrawals/route";
import bankRouter from "./banks/route";
import { securePayment, webhook } from "./wallets/controller";
import userCompetitionRouter from "./user-competitions/route";
import feedbackRouter from "./feedbacks/route";
import memberRouter from "./members/route";
import contestRouter from "./contests/route";
import settlementRouter from "./settlement/routes";
import poolRouter from "./pools/route";
import poolMemberRouter from "./pool-members/route";

const router = Router();
router.use("/users", userRouter);
router.use("/pins", Authenticate, pinRouter);
router.use("/banks", Authenticate, bankRouter);
router.use("/matches", Authenticate, matchRouter);
router.use("/wallets", walletRouter);
router.use("/contest", Authenticate, contestRouter);
router.use("/feedbacks", Authenticate, feedbackRouter);
router.use("/predictions", Authenticate, predictionRouter);
router.use("/withdrawals", Authenticate, withdrawalRouter);
router.use("/members", Authenticate, memberRouter);
router.use("/competitions", Authenticate, competitionRouter);
router.use("/transactions", Authenticate, transactionRouter);
router.use("/pools", Authenticate, poolRouter);
router.use("/pool-members", Authenticate, poolMemberRouter);
router.use("/user-competitions", Authenticate, userCompetitionRouter);

router.get("/pay", securePayment)
router.get("/webhook", webhook)
router.use("/settlements", settlementRouter)

export default router;
