export const IS_PRODUCTION = process.env.NODE_ENV === "production"
export const { SERVER_TIMEZONE, PORT = "5000" } = process.env
export const ORIGIN = process.env.ORIGIN?.split(",") || []