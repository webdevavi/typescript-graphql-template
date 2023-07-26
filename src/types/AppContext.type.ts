import { Request, Response } from "express"
import { Types } from "mongoose"
import { User } from "../entities"

export type AppContext = {
    req: Request
    res: Response
}

export type AuthorizedAppContext = {
    req: Request
    res: Response
    user: User
    sessionId: Types.ObjectId
}