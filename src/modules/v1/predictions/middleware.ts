/** @format */

import { NextFunction, Request, Response } from "express"
import { catchError } from "../../common/utils";

export const validateCreate = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { outcome } = req.body;
    try {
        const score = outcome.split('-');
        const homeScore = score[0];
        const awayScore = score[1];

        if ((!Number(homeScore) && Number(homeScore) !== 0) || (!Number(awayScore) && Number(awayScore) !== 0)) {
            throw catchError('Acceptable prediction is {homeScore}-{awayScore}', 400)
        }

        return next()
    } catch (error) {
        next(error)
    }
}
