import { OtpTypesEnum } from "../enums/otp.enums.js";

export function OTPKey(email: string, reason: OtpTypesEnum)
{
    const formattedReason = OtpTypeKeyName(reason);

    return `OTP:${email}:${formattedReason}`;
}

export function OTPBlockedKey(email: string, reason: OtpTypesEnum)
{
    const formattedReason = OtpTypeKeyName(reason);

    return `OTP:${email}:${formattedReason}:Blocked`;
}

export function OTPReqNoKey(email: string, reason: OtpTypesEnum)
{
    const formattedReason = OtpTypeKeyName(reason);

    return `OTP:${email}:${formattedReason}:No`;
}


export function OtpTypeKeyName(value: OtpTypesEnum)
{
    return Object.keys(OtpTypesEnum).find((key) =>
    {
        if (!(key in OtpTypesEnum))
        {
            return false;
        }
        // @ts-ignore
        return OtpTypesEnum[key] === value;

    });
}