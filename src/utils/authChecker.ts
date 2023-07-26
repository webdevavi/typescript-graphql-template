import { AuthChecker } from "type-graphql"
import { createCustomLogger } from "../logger"
import { AuthorizedAppContext } from "../types"
import { ensureAuth } from "./ensureAuth"

export const authChecker: AuthChecker<AuthorizedAppContext> = async ({
    context,
}) => {
    const logger = createCustomLogger("authChecker")

    try {
        const sessionToken =
            context.req.headers.authorization?.replace("Bearer ", "") || ""

        if (!sessionToken) return false

        const { isAuthorized, sessionId, user } = await ensureAuth(sessionToken)

        if (!isAuthorized || !sessionId || !user) return false

        context.sessionId = sessionId
        context.user = user

        return true
    } catch (error: any) {
        logger.error(error.message)
        return false
    }
}
