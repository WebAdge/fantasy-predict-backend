/** @format */

import { Request } from "express"
import { PopulateOptions } from "mongoose"

interface DefaultAttributes {
    _id?: string
    deletedAt?: string
    createdAt?: string
    updatedAt?: string
}

interface IUser extends DefaultAttributes {
    firstName: string
    lastName: string
    email: string
    username: string
    countryCode: string
    gender: string
    phoneNumber: string
    dateOfBirth: Date
    password: string
    verifiedAt: Date
    otp: string
    bvn: string
    isActive: boolean
    avatar: string
    sendNotification: boolean
}

interface IAdmin extends DefaultAttributes {
    firstName: string
    lastName: string
    email: string
    password: string
    isActive: boolean
}

interface IWallet extends DefaultAttributes {
    user: string
    balance: number
    currency: string
    dateOfLastTopUp?: Date
    bank?: {
        bankName: string
        accountName: string
        accountNumber: string
    }
}

interface ISettlement extends DefaultAttributes {
    type: string
    meta: {
        customer_reference: string
        transaction_reference: string
        processorReference: string
        amount: string
        charge: string
        netAmount: string
        expectedAmount: string
        channel: string
        sender: {
            originatorBank: string
            originatorName: string
            originatorAccountNumber: string
        }
        recipient: string
        account_reference: string
        status: string
        createdAt: string
        updatedAt: string
        meta: { customerMeta: any[]; notification: any[] }
        customerMeta: []
        subaccount: []
    }
    status: ITransactionStatus
}
interface IPin extends DefaultAttributes {
    code: string
    user: string
    attemptLeft: number
    lastChangedAt: Date
}

type TransactionStatus = "pending" | "successful" | "failed"
type TransactionType = "credit" | "debit"

interface ITransaction extends DefaultAttributes {
    user: string
    fee: number
    amount: number
    wallet: string
    status: TransactionStatus
    type: TransactionType
    reference: string
    currency: string
    wasReverted?: boolean
    wasRefunded?: boolean
    dateReverted?: Date
    dateRefunded?: Date
    dateInitiated: Date
    dateCompleted?: Date
    meta?: Record<string, any>
}

interface IPool extends DefaultAttributes {
    name: string
    description: string
    privacy: "public" | "private"
    config: {
        amount: number
        paid: boolean
        poolSharing: "first-take-all" | "top-three"
        endDate: Date
        code: string
    }
    totalMembers: number
    competition: string
    isActive: boolean
    createdBy: string
    icon?: string
}

type GameWeek = { week: number; point: number }

interface IPoolMember extends DefaultAttributes {
    pool: string
    user: string
    gameWeeksParticipated: GameWeek[]
    totalAmountSpent: number
    status: "approved" | "declined" | "pending"
    type: "player" | "captain"
}

type Area = {
    id: number
    name: string
    code: string
    flag: string
}

type Season = {
    id: number
    startDate: string
    endDate: string
    currentMatchday: number
    winner: string
}

type ICompetitionResponse = {
    id: number
    area: Area
    name: string
    code: string
    type: "CUP" | "LEAGUE" | string
    emblem: string
    plan: "TIER_ONE" | "TIER_TWO" | "TIER_THREE" | "TIER_FOUR"
    currentSeason: Season
    numberOfAvailableSeasons: number
    lastUpdated: Date
}

interface Area {
    id: number
    name: string
    code: string
    flag: string
}

interface Competition {
    id: number
    name: string
    code: string
    type: "LEAGUE" | "CUP" | string // Add other possible competition types
    emblem: string
}

interface Season {
    id: number
    startDate: string // ISO 8601 date string
    endDate: string // ISO 8601 date string
    currentMatchday: number
    winner: null | { id: number; name: string } // Adjust based on actual winner data structure
}

interface Team {
    id: number
    name: string
    shortName: string
    tla: string // Three-letter abbreviation
    crest: string
}

interface Score {
    winner: "HOME_TEAM" | "AWAY_TEAM" | "DRAW" | null
    duration: "REGULAR" | "EXTRA_TIME" | "PENALTY_SHOOTOUT" | string
    fullTime: {
        home: number
        away: number
    }
    halfTime: {
        home: number
        away: number
    }
}

interface Referee {
    id: number
    name: string
    // Add other referee properties if available
}

interface Match {
    id: number
    area: Area
    competition: Competition
    season: Season
    utcDate: string // ISO 8601 date-time string
    status:
        | "FINISHED"
        | "SCHEDULED"
        | "LIVE"
        | "IN_PLAY"
        | "PAUSED"
        | "POSTPONED"
        | "SUSPENDED"
        | "CANCELED"
    matchday: number
    stage:
        | "REGULAR_SEASON"
        | "GROUP_STAGE"
        | "LAST_16"
        | "QUARTER_FINALS"
        | "SEMI_FINALS"
        | "FINAL"
        | string
    group: null | string
    lastUpdated: string // ISO 8601 date-time string
    homeTeam: Team
    awayTeam: Team
    score: Score
    referees: Referee[]
}

interface ICompetition extends DefaultAttributes {
    name: string
    type: string
    code: string
    filters: [{ name: string; value: string }]
    default: boolean
}

interface IUserCompetition extends ICompetition {
    user: string
    competition: string
}

interface IMatch extends DefaultAttributes {
    status: "ongoing" | "finished" | "scheduled" | string
    homeTeam: {
        name: string
        shortName: string
        crest: string
        score: number | null
    }
    awayTeam: {
        name: string
        shortName: string
        crest: string
        score: number | null
    }
    matchday: string
    date: Date
    competition: string
    stage: string
    matchId: string
}

interface IPrediction extends DefaultAttributes {
    user: string
    match: string
    point: number
    pool: string
    status: "pending" | "completed"
    outcome: string
    competition: string
}

interface IFeedback extends DefaultAttributes {
    user: string
    message: string
}

interface IWithdrawal extends DefaultAttributes {
    user: string
    amount: string
    meta: Record<string, any>
}

interface IBank extends DefaultAttributes {
    user: string
    bankName: string
    bankCode: string
    accountName: string
    accountNumber: string
}

interface IContest extends DefaultAttributes {
    user: string
    title: string
    endDate: Date
    amount: number
    startDate: Date
    description: string
    competition: string
    totalUsersJoined: number
    type: "public" | "private"
    winType: {
        first: number // perecentage
        second: number
        third: number
    }
    invitationCode: string
}

interface IMember extends DefaultAttributes {
    contest: string
    user: string
    status: "pending" | "approved"
    type: "captain" | "member"
}

type MatchData = {
    area: {
        id: number
        name: string
        code: string
        flag: string
    }
    competition: {
        id: number
        name: string
        code: string
        type: string
        emblem: string
    }
    season: {
        id: number
        startDate: string // ISO date string
        endDate: string // ISO date string
        currentMatchday: number
        winner: null | any // adjust if winner data becomes known
    }
    id: number
    utcDate: string // ISO date string
    status: string
    venue: string | null
    matchday: number
    stage: string
    group: string | null
    lastUpdated: string // ISO date string
    homeTeam: {
        id: number
        name: string
        shortName: string
        tla: string
        crest: string
    }
    awayTeam: {
        id: number
        name: string
        shortName: string
        tla: string
        crest: string
    }
    score: {
        winner: string | null
        duration: string
        fullTime: {
            home: number | null
            away: number | null
        }
        halfTime: {
            home: number | null
            away: number | null
        }
    }
    odds: {
        msg: string
    }
    referees: any[] // replace with detailed referee type if known
}

type ISarepayBankResponse = {
    code: string
    name: string
}

type ISarepayValidateResponse = {
    account_number: string
    account_name: string
}

type ISarepayVerifyTransReponse = {
    reference: string
    amount: string
    charge: string
    status: string
    recipient_name: string
    recipient_bank_code: string
    recipient_account_number: string
    processor_reference: string
    merchant_reference: string
}

type ISarepayVirtualResponse = {
    account_number: string
    account_name: string
    bank: string
    status: string
    expires_at: string
    validity_type: string
}

type PaystackResponse = {
    status: boolean
    message: string
    data: PaystackResponseData
}

type ISarepayPayment = {
    key: string
    token: string
    amount: number
    currency: "NGN"
    feeBearer: "merchant"
    defaultPaymentMethod: "card"
    paymentMethods: string[]
    customer: {
        name: string
        email: string
    }
    containerId: string
    metadata: {
        taxIs: string
        customerId: string
        redirect_url: string // specify this to redirect your customers after payment
    }
    reference: string
}

interface IPaginator<T> {
    query?: T
    page: number
    limit: number
    select?: string
    populate?: PopulateOptions[] | PopulateOptions
}

type IPaginateResponse<T> = {
    docs: T[]
    limit: number
    hasNextPage: boolean
    hasPrevPage: boolean
    hasMore: boolean
    totalDocs: number
    page: number
    totalPages: number
}

type CreateErr = (message: string, code?: number, validations?: object) => Error

type Token = IUser & { time: Date }

declare module "express-serve-static-core" {
    export interface Request {
        user: IUser;
        admin: IAdmin
    }
}

type AppError = Error & {
    code: number
    name?: string
    message: string
    validations?: object | null
}

type Fix = any
