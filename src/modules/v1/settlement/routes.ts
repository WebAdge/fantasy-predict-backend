import { Router } from "express";
import { processIncomingTransfer } from "./controller";

const settlementRouter = Router();

settlementRouter.post('/', processIncomingTransfer);

export default settlementRouter;