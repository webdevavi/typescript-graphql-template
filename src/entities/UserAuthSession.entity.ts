import { model, Schema, Types } from "mongoose"
import { Field, ObjectType } from "type-graphql"
import { ITimestamps, Timestamps } from "./Timestamps.entity"

export interface UserAuthSession extends ITimestamps {
    _id: Types.ObjectId
    userId: Types.ObjectId
    ip?: string
    loggedInAt: Date
    loggedOutAt?: Date
}

@ObjectType()
export class UserAuthSession extends Timestamps implements UserAuthSession {
    @Field(() => String)
    _id!: Types.ObjectId

    @Field(() => String)
    userId!: Types.ObjectId

    @Field({ nullable: true })
    ip?: string

    @Field(() => Date)
    loggedInAt!: Date

    @Field(() => Date, { nullable: true })
    loggedOutAt?: Date
}

const UserAuthSessionSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "Admin",
            required: true,
        },
        ip: { type: String, required: false },
        loggedInAt: { type: Date, required: true },
        loggedOutAt: { type: Date, required: false },
    },
    { timestamps: true }
)

export const UserAuthSessionModel = model<UserAuthSession>(
    "UserAuthSession",
    UserAuthSessionSchema
)
