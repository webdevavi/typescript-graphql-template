import { ApolloServer } from "apollo-server-express"
import cors from "cors"
import express from "express"
import { execute, subscribe } from "graphql"
import helmet from "helmet"
import { createServer } from "http"
import mongoose from "mongoose"
import "reflect-metadata"
import { SubscriptionServer } from "subscriptions-transport-ws"
import { getApolloConfig } from "./src/config"
import {
    IS_PRODUCTION,
    MONGODB_CONNECTION_URL,
    ORIGIN,
    PORT,
    SERVER_TIMEZONE,
} from "./src/constants"
import { createCustomLogger } from "./src/logger"
import { configureTimezone, ensureAuth } from "./src/utils"

export const startApp = async () => {
    const logger = createCustomLogger("APP")
    configureTimezone()

    logger.info("initializing the app")

    const app = express()

    app.set("trust proxy", true)

    const httpServer = createServer(app)

    // middleswares
    app.use(express.json())
    app.use(cors({ origin: ORIGIN }))
    app.use(
        helmet({ contentSecurityPolicy: IS_PRODUCTION ? undefined : false })
    )

    // healthcheck
    app.get("/", (_, res) => res.status(200).end())

    logger.info(`using server timezone "${SERVER_TIMEZONE}"`)
    process.env.TZ = SERVER_TIMEZONE

    logger.info("initializing connection to the database")

    if (!MONGODB_CONNECTION_URL) {
        logger.error(`server error: env var MONGODB_CONNECTION_URL not found`)

        logger.info("exiting process")
        httpServer.close()
        process.exit()
    }

    mongoose.set("strictQuery", false)
    await mongoose
        .connect(MONGODB_CONNECTION_URL)
        .then(() => logger.info("connected to database successfully"))

    mongoose.connection.on("connected", () =>
        logger.info("connected to database successfully")
    )

    mongoose.connection.on("disconnected", () => {
        logger.info("disconnected from database")

        if (IS_PRODUCTION) {
            logger.info("exiting process")
            httpServer.close()
            process.exit()
        }
    })

    mongoose.connection.on("error", (error) => {
        logger.info(`connection to database failed: ${error.message}`)
        if (IS_PRODUCTION) {
            logger.info("exiting process")
            httpServer.close()
            process.exit()
        }
    })

    logger.info("creating apollo config")

    await getApolloConfig()
        .then(async (config) => {
            logger.info("initializing apollo server")
            logger.profile("initialized the apollo server successfully")

            const apolloServer = new ApolloServer(config)

            await apolloServer.start().catch((error) => {
                logger.error(`failed starting apollo server: ${error.message}`)

                logger.info("exiting process")
                process.exit()
            })

            apolloServer.applyMiddleware({
                app,
                cors: false,
            })

            logger.profile("initialized the apollo server successfully")

            logger.info("initializing graphql subscription server")
            logger.profile("initialized the graphql subscription server")

            const subscriptionServer = SubscriptionServer.create(
                {
                    schema: config.schema,
                    execute,
                    subscribe,
                    onConnect: (connectionParams: any) =>
                        ensureAuth(connectionParams.sessionToken),
                },
                { server: httpServer, path: apolloServer.graphqlPath }
            )

            Array.from(["SIGINT", "SIGTERM"]).forEach((signal) => {
                process.on(signal, () => subscriptionServer.close())
            })

            logger.profile("initialized the graphql subscription server")
        })
        .catch((error: any) => {
            logger.error(
                `failed creating apollo config: ${error.message}; ${error.details}`
            )

            logger.info("exiting process")
            process.exit()
        })

    httpServer.on("error", (error) => {
        logger.error(`http server failed: ${error.message}`)

        logger.info("exiting process")
        process.exit()
    })

    await new Promise<void>((resolve) => {
        httpServer.listen(PORT, () => {
            if (!IS_PRODUCTION) {
                logger.info(
                    `http server up and running at http://localhost:${PORT}`
                )
            } else {
                logger.info(`http server up and running at port ${PORT}`)
            }
            resolve()
        })
    })

    return httpServer
}
