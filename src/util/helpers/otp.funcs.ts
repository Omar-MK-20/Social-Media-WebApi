
export function otpRedisKey(hashedOTP: string, reason: string)
{
    return `OTP:${hashedOTP}:${reason}`;
}