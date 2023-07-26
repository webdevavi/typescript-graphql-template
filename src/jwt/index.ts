import { sign, verify } from "jsonwebtoken"
import { JWT_SECRET_STRING } from "../constants"

export const signSessionId = (sessionId: string) => {
    return sign(sessionId, JWT_SECRET_STRING)
}

export const verifySessionToken = (sessionToken: string) => {
    return verify(sessionToken, JWT_SECRET_STRING) as string
}