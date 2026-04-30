export enum OtpTypesEnum
{
    verifyEmail = "verify your email address",
    resetPassword = "reset your password"
};


export function objectKeyName(obj: any, value: string)
{
    return Object.keys(obj).find(key => obj[key] === value) as string
}