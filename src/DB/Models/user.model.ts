import { model, Schema } from "mongoose";
import { GenderEnum, ProviderEnum, RoleEnum } from "../../util/enums/user.enums.js";
import type { IUser } from '../../util/interfaces/IUser.js';

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
    },
    confirmEmail: {
        type: Boolean,
        default: false,
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

}, {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});


export const UserModel = model<IUser>("users", userSchema);