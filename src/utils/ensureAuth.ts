import mongoose from "mongoose"
import { UserAuthSessionModel, UserModel } from "../entities"
import { verifySessionToken } from "../jwt"
import { getMeUserLookupPipeline } from "../pipelines"

export const ensureAuth = async (sessionToken: string) => {
    const sessionId = verifySessionToken(sessionToken)

    if (!sessionId) return { isAuthorized: false, user: null, sessionId: null }

    const session = await UserAuthSessionModel.findOne({
        _id: sessionId,
        loggedOutAt: undefined,
    })

    if (!session) return { isAuthorized: false, user: null, sessionId: null }

    const user = await UserModel.findById(session.userId)

    if (!user) return { isAuthorized: false, user: null, sessionId: null }

    return { isAuthorized: true, user, sessionId }
}
