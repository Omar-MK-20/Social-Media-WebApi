import type { HydratedDocument } from 'mongoose';
import { model, Schema } from "mongoose";
import { GenderEnum, ProviderEnum, RoleEnum } from "../../util/enums/user.enums.js";

export interface IUser
{
    username: string;
    email: string;
    password: string;
    DOB?: Date | undefined;
    gender?: GenderEnum | undefined;
    confirmEmail?: boolean | undefined;
    phone?: string | undefined;
    role?: RoleEnum | undefined;
    provider: ProviderEnum;
    profilePic?: string | undefined;
    coverPics?: string[] | undefined;
    changeCreditTime: Date;
}


export type HUser = HydratedDocument<IUser>;


const userSchema = new Schema<IUser>({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        required: function (): boolean { return this.provider == ProviderEnum.System; },
        select: false,
    },
    DOB: Date,
    gender: {
        type: Number,
        enum: GenderEnum,
        default: GenderEnum.Male,
        required: false,
    },
    confirmEmail: {
        type: Boolean,
        default: false,
        required: false,
    },
    phone: {
        type: String,
    },
    role: {
        type: Number,
        enum: RoleEnum,
        default: RoleEnum.User,
    },
    profilePic: String,
    coverPics: [String],
    provider: {
        type: Number,
        enum: ProviderEnum,
        default: ProviderEnum.System
    },
    changeCreditTime: Date

});


export const UserModel = model<IUser>("users", userSchema);