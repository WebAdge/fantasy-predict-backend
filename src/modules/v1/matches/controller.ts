/** @format */
import { NextFunction, Request, Response } from "express"

import { catchError, success, tryPromise } from "../../common/utils"
import MatchService from "./service"
import { matchPipeline, scorePipeline } from "./helper"
import FootballData from "../../thirdpartyApi/football"
import CompetitionService from "../competitions/service"
import { addMonths, endOfWeek, format, startOfWeek } from "date-fns"

export const getMatchWeek = async (query: Record<string, string>) => {
    const { competition, userId } = query

    let result
    const [matches, error] = await tryPromise(
        new MatchService({}).aggregate(matchPipeline(query, userId))
    )

    console.log({ error })
    console.log({ matches })
    if (error) throw catchError("Error processing request")
    result = matches || []
    if (!matches?.length) {
        const comp = await new CompetitionService({
            _id: competition,
        }).findOne()

        console.log({ comp })
        if (!comp) throw catchError("Error processing request", 400)
        const date = {
            dateFrom: format(startOfWeek(new Date()), "yyyy-MM-dd"),
            dateTo: format(addMonths(endOfWeek(new Date()), 3), "yyyy-MM-dd"),
        }
        const matchQuery = await new FootballData().getCompetitionMatches(
            comp.code,
            { ...date }
        )

        const newMatches = matchQuery.map(match => ({
            status: match.status.toLowerCase(),
            matchId: String(match.id),
            homeTeam: {
                name: match.homeTeam.name,
                shortName: match.homeTeam.shortName,
                crest: match.homeTeam.crest,
                score: match.score.fullTime.home,
            },
            awayTeam: {
                name: match.awayTeam.name,
                shortName: match.awayTeam.shortName,
                crest: match.awayTeam.crest,
                score: match.score.fullTime.away,
            },
            matchday: String(match.matchday),
            date: new Date(match.utcDate),
            competition: competition,
            stage: match.stage,
        }))
        result = await new MatchService({}).bulkCreate(newMatches)
    }
    return result
}

export const fetch = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        let result
        const [matches] = await tryPromise(
            new MatchService({}).aggregate(
                matchPipeline({ ...(req.query as any) }, String(req.user._id))
            )
        )

        result = matches || []

        if (!matches?.length) {
            await getMatchWeek({
                ...req.query,
                userId: req.user._id,
            } as Record<string, string>)
            const [mths] = await tryPromise(
                new MatchService({}).aggregate(
                    matchPipeline(
                        { ...(req.query as any) },
                        String(req.user._id)
                    )
                )
            )
            result = mths || []
        }

        return res
            .status(200)
            .json(success("Match retrieved successfully", result || []))
    } catch (error) {
        next(error)
    }
}

export const fetchByMatchday = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { matchday, competition } = req.query
    try {
        const [matches] = await tryPromise(
            new MatchService({}).aggregate(
                matchPipeline(
                    {
                        matchday: String(matchday),
                        competition: String(competition),
                    },
                    String(req.user._id)
                )
            )
        )

        const [comp] = await tryPromise(
            new CompetitionService({ _id: String(competition) }).findOne()
        )
        return res
            .status(200)
            .json(
                success("Match retrieved successfully", {
                    matches: matches || [],
                    competition: comp,
                })
            )
    } catch (error) {
        next(error)
    }
}

export const fetchScore = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { competition } = req.query
    const { _id } = req.user
    try {
        const [matches, error] = await tryPromise(
            new MatchService({}).aggregate(
                scorePipeline(String(competition), String(_id))
            )
        )

        console.log(error)
        if (error) throw catchError("Error processing request")

        return res
            .status(200)
            .json(success("Score retrieved successfully", matches))
    } catch (error) {
        next(error)
    }
}
