import {
    ApolloServerPluginLandingPageDisabled,
    ApolloServerPluginLandingPageGraphQLPlayground,
} from "apollo-server-core"
import { ApolloServerExpressConfig } from "apollo-server-express"
import { buildSchema } from "type-graphql"
import { IS_PRODUCTION } from "../constants"
import { AppContext } from "../types"
import { authChecker } from "../utils"

export const getApolloConfig =
    async (): Promise<ApolloServerExpressConfig> => ({
        schema: await buildSchema({
            resolvers: [],
            authChecker,
            validate: false,
        }),

        plugins: [
            IS_PRODUCTION
                ? ApolloServerPluginLandingPageDisabled()
                : ApolloServerPluginLandingPageGraphQLPlayground(),
        ],

        context: ({ req, res }): AppContext => ({
            req,
            res,
        }),
    })
