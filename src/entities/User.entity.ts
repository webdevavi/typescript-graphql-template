import { model, Schema, Types } from "mongoose"
import { Field, ObjectType } from "type-graphql"
import { ITimestamps, Timestamps } from "./Timestamps.entity"

export interface IUser extends ITimestamps {
    _id: Types.ObjectId
    name: string
}

@ObjectType()
export class User extends Timestamps implements IUser {
    @Field(() => String) _id!: Types.ObjectId
    @Field() name!: string
}

export const UserSchema = new Schema(
    {
        name: { type: String, required: true, text: true },
    },
    { timestamps: true }
)

export const UserModel = model<User>("User", UserSchema)
