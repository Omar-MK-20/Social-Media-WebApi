import { model, Schema } from "mongoose";
import { GenderEnum, ProviderEnum, RoleEnum } from "../../util/enums/user.enums.js";
import type { IUser } from '../../util/interfaces/IUser.js';
import { decrypt, encrypt, type TEncrypt } from "../../util/security/encryption.js";
import { ResponseError } from "../../util/res/ResponseError.js";
import { hashingPassword } from "../../util/security/hashing.js";

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
            if (this.isNew) return value;
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
    changeCreditTime: Date,
    views: {
        type: Number,
        default: 0
    },
    deletedAt: Date
}, {
    timestamps: true,
    toObject: { getters: true },
    toJSON: { getters: true }
});

userSchema.pre("save", async function ()
{
    if (this.isModified("password"))
    {
        this.password = await hashingPassword(this.password);
    }

    if (this.phone && this.isModified("phone")) this.phone = encrypt(this.phone);
});

userSchema.pre(["find", "findOne"], function ()
{
    const query = this.getQuery();
    const { isDeleted, ...restQuery } = query;

    if (query.isDeleted == true)
    {
        this.setQuery({ $or: [{ ...restQuery }, { $and: [{ ...restQuery }, { deletedAt: { $exists: true } }] }] });

    }
    else
    {
        this.setQuery({ ...restQuery, deletedAt: { $exists: false } });
    }
});

userSchema.pre("updateOne", function ()
{
    const updateQuery = this.getUpdate();

    //@ts-ignore
    const { delete: boolean, ...restUpdateQuery } = updateQuery;

    //@ts-ignore
    if (updateQuery?.delete == true)
    {
        // @ts-ignore
        this.setUpdate({ $set: { ...restUpdateQuery.$set, deletedAt: new Date() }, $setOnInsert: restUpdateQuery.$setOnInsert });
    }
    else
    {
        this.setUpdate({ ...restUpdateQuery });
    }
});

export const UserModel = model<IUser>("users", userSchema);