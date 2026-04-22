import { model, Schema } from "mongoose";
import { GenderEnum, ProviderEnum, RoleEnum } from "../../util/enums/user.enums.js";
import type { IUser } from '../../util/interfaces/IUser.js';
import { decrypt, type TEncrypt } from "../../util/security/encryption.js";
import { ResponseError } from "../../util/res/ResponseError.js";

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
        get: function (value: string)
        {
            if (!value) return;
            console.log(value);
            try
            {
                return decrypt(value as TEncrypt);
            }
            catch (error)
            {
                throw new ResponseError("Error decrypting user's phone", 500, { error });
            }

        }
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
    toObject: { getters: true },
    toJSON: { getters: true }
});


export const UserModel = model<IUser>("users", userSchema);