import type { HydratedDocument } from "mongoose";
import type { GenderEnum, ProviderEnum, RoleEnum } from "../enums/user.enums.js";
import type { TEncrypt } from "../security/encryption.js";

export interface IUser
{
    username: string;
    email: string;
    password: string;
    DOB?: Date | undefined;
    gender?: GenderEnum | undefined;
    confirmEmail: boolean;
    phone?: string | TEncrypt | undefined;
    role: RoleEnum;
    provider: ProviderEnum;
    profilePic?: string | undefined;
    coverPics?: string[] | undefined;
    changeCreditTime?: Date;
}


export type HUser = HydratedDocument<IUser>;
