import redisService from "../../DB/Redis/redis.service.js";
import { OtpTypesEnum } from "../enums/otp.enums.js";
import { OTPBlockedKey, OTPKey, OTPReqNoKey } from "../helpers/otp.funcs.js";
import { ForbiddenError, GoneError, UnauthorizedError } from "../res/ResponseError.js";
import { hashingPassword } from "../security/hashing.js";
import { generateOTP } from "../security/otp.js";
import { sendMail } from "./mail.config.js";

class MailService
{
    private _redisService = redisService;
    constructor() { }

    async sendEmailOTP({ user, reason }: { user: { email: string; username: string; }; reason: OtpTypesEnum; })
    {
        const prevOtpTtl = await this._redisService.ttl(OTPKey(user.email, reason));
        if (prevOtpTtl > 0)
        {
            throw new GoneError({ message: "there is already valid OTP", info: { "Previous OPT valid for": prevOtpTtl } });
        }

        const isOtpBlocked = await this._redisService.exists(OTPBlockedKey(user.email, reason));
        if (isOtpBlocked)
        {
            throw new UnauthorizedError({ message: "Try again later" });
        }

        const reqNumber = await this._redisService.get(OTPReqNoKey(user.email, reason));
        if (Number(reqNumber) == 5)
        {
            await this._redisService.set({ key: OTPBlockedKey(user.email, reason), value: 1, exValue: 10 * 60 });

            throw new ForbiddenError({ message: "Too many OTP requests", info: { tries: reqNumber } });
        }

        const otp = generateOTP();

        // Question isn't it better to remove await, so it sends an email in the background?
        await sendMail({ email: user.email, username: user.username, reason: reason, otp: otp, });

        await this._redisService.set({ key: OTPKey(user.email, reason), value: await hashingPassword(otp), exValue: 2 * 60 });

        const existOtpReqNo = await this._redisService.exists(OTPReqNoKey(user.email, reason));
        if (!existOtpReqNo)
        {
            await this._redisService.set({ key: OTPReqNoKey(user.email, reason), value: 0, exValue: 10 * 60 });
        }

        await this._redisService.incr(OTPReqNoKey(user.email, reason));
    }

}


export default new MailService();