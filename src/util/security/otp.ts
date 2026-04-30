import redisRepo from "../../DB/Redis/redis.service.js";
import { objectKeyName, OtpTypesEnum } from "../enums/otp.enums.js";
import { otpRedisKey } from "../helpers/otp.funcs.js";
import { compareHashes, hashingPassword } from "./hashing.js";

export function generateOTP(): string
{
    return Math.floor(100000 + Math.random() * 900000).toString();
}


export async function saveOTP(otp: string, reason: OtpTypesEnum, email: string)
{
    const hashedOTP = await hashingPassword(otp);

    const key = otpRedisKey(hashedOTP, objectKeyName(OtpTypesEnum, reason));
    console.log({ key });

    const result = await redisRepo.set({ key: key, value: email });

    console.log({ result });
    return result;
}

export async function verifyOTP(otp: string)
{
    // const isOtpCorrect  = compareHashes()
}
