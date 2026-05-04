import type { Types } from "mongoose";
import { randomUUID } from "node:crypto";
import redisService from "../../DB/Redis/redis.service.js";
import userRepo from "../../DB/Repos/user.repo.js";
import { OtpTypesEnum } from "../../util/enums/otp.enums.js";
import { TokenType } from "../../util/enums/token.enums.js";
import { GenderEnum, ProviderEnum, RoleEnum } from "../../util/enums/user.enums.js";
import { OTPKey } from "../../util/helpers/otp.funcs.js";
import mailService from "../../util/nodemailer/mail.service.js";
import { ConflictError, ContentError, ForbiddenError, GoneError, UnauthorizedError } from "../../util/res/ResponseError.js";
import { successObject } from "../../util/res/ResponseObject.js";
import { encrypt, type TEncrypt } from "../../util/security/encryption.js";
import { verifyGoogleAuth } from "../../util/security/googleOAuth.js";
import { compareHashes, hashingPassword } from "../../util/security/hashing.js";
import tokenService from "../../util/security/token.service.js";
import { StatusCodeEnum, type TResponseObject } from "../../util/types/ResponseTypes.js";
import type { LoginDTO, SignupDTO } from "./auth.dto.js";



type TLoginWithEmail = Promise<TResponseObject<{
    accessToken: string;
    refreshToken: string;
    username: string;
    email: string;
    DOB?: Date | undefined;
    gender?: GenderEnum | undefined;
    confirmEmail: boolean;
    phone?: string | TEncrypt | undefined;
    role: RoleEnum;
    provider: ProviderEnum;
    profilePic?: string | undefined;
    coverPics?: string[] | undefined;
    changeCreditTime?: Date;
    _id: Types.ObjectId;
    __v: number;
}>>;



class AuthService
{

    private _userRepo = userRepo;
    private _tokenService = tokenService;
    private _redisService = redisService;
    private _mailService = mailService;

    constructor() { }

    public async signup(bodyData: SignupDTO)
    {
        const { email } = bodyData;

        const existEmail = await this._userRepo.findByEmail(email);
        if (existEmail)
        {
            throw new ConflictError({ message: "Email already exist" });
        }

        bodyData.password = await hashingPassword(bodyData.password);

        if (bodyData.phone) bodyData.phone = encrypt(bodyData.phone);

        const { password, ...result } = (await this._userRepo.create(bodyData)).toObject();


        await this._mailService.sendEmailOTP({
            user: { email: result.email, username: result.username },
            reason: OtpTypesEnum.verifyEmail
        });

        return successObject(201, "Check your inbox", result);
    }


    public async login(bodyData: LoginDTO)
    {

        const existUser = await this._userRepo.findByEmail(bodyData.email, "+password");
        if (!existUser)
        {
            throw new UnauthorizedError({ message: "Invalid Email or Password", info: { bodyData } });
        }

        if (existUser.provider !== ProviderEnum.System)
        {
            // TODO replace `Provider` with actual provider name by getting the of the enum
            throw new UnauthorizedError({ message: `Login with your Provider Account`, info: { email: existUser.email } });
        }

        if (existUser.confirmEmail == false)
        {
            throw new UnauthorizedError({ message: "Verify your email first", info: { email: existUser.email } });
        }

        const isPasswordCorrect = await compareHashes(existUser.password, bodyData.password);
        if (!isPasswordCorrect)
        {
            throw new UnauthorizedError({ message: "Invalid Email or Password", info: { bodyData } });
        }

        const { password, ...user } = existUser.toObject();

        const uuid = randomUUID();

        const accessToken: string = this._tokenService.generateToken({ id: user._id, email: user.email, role: user.role }, TokenType.access, uuid);
        const refreshToken: string = this._tokenService.generateToken({ id: user._id, email: user.email, role: user.role }, TokenType.refresh, uuid);

        return successObject(200, `${user.username} Logged in successfully`, { ...user, accessToken, refreshToken });

    }


    public async signupWithGoogle(idToken: string): TLoginWithEmail
    {
        const googleTokenPayload = await verifyGoogleAuth(idToken);

        if (!googleTokenPayload)
        {
            throw new ContentError({ message: "Invalid idToken from Google", info: { idToken } });
        }

        if (!googleTokenPayload.email_verified)
        {
            throw new UnauthorizedError({ message: "email must be verified", info: { email: googleTokenPayload.email, isVerified: googleTokenPayload.email_verified } });
        }

        const existUser = await this._userRepo.findOne({ email: googleTokenPayload.email as string });

        if (existUser)
        {
            if (existUser.provider == ProviderEnum.System)
            {
                throw new ConflictError({ message: "account already exist, login with your email and password", info: { email: googleTokenPayload.email } });
            }
            return this.loginWithGoogle(idToken);
        }

        const userObject = {
            email: googleTokenPayload.email as string,
            username: googleTokenPayload.name as string,
            confirmEmail: googleTokenPayload.email_verified,
            profilePic: googleTokenPayload.picture,
            provider: ProviderEnum.Google,
        };

        const newUser = await this._userRepo.create(userObject);

        return this.loginWithGoogle(idToken);
    }


    public async loginWithGoogle(idToken: string): TLoginWithEmail
    {
        const googleTokenPayload = await verifyGoogleAuth(idToken);

        if (!googleTokenPayload)
        {
            throw new ContentError({ message: "Invalid idToken from Google", info: { idToken } });
        }

        if (!googleTokenPayload.email_verified)
        {
            throw new UnauthorizedError({ message: "email must be verified", info: { email: googleTokenPayload.email, isVerified: googleTokenPayload.email_verified } });
        }

        const existUser = await this._userRepo.findOne({ email: googleTokenPayload.email as string });

        if (!existUser)
        {
            return this.signupWithGoogle(idToken);
        }

        if (existUser.provider == ProviderEnum.System)
        {
            throw new ConflictError({ message: "account already exist, login with your email and password", info: { email: googleTokenPayload.email } });
        }


        let { password, ...user } = existUser!.toObject();


        const uuid = randomUUID();

        const accessToken: string = this._tokenService.generateToken({ id: user._id, email: user.email, role: user.role }, TokenType.access, uuid);
        const refreshToken: string = this._tokenService.generateToken({ id: user._id, email: user.email, role: user.role }, TokenType.refresh, uuid);

        return successObject(200, "login successful", { ...user, accessToken, refreshToken });

    }


    public async confirmEmail(bodyData: { email: string, otp: string; })
    {
        const { email, otp } = bodyData;

        const existUser = await this._userRepo.findOne({ email: email, confirmEmail: false });
        if (!existUser)
        {
            throw new UnauthorizedError({ message: "Invalid Email or Email already confirmed", info: { email } });
        }

        const existOTP = await this._redisService.get(OTPKey(email, OtpTypesEnum.verifyEmail));
        if (!existOTP)
        {
            throw new ForbiddenError({ message: "Expired OTP", info: { email } });
        }

        const isOTPValid = await compareHashes(existOTP, otp.toString());
        if (!isOTPValid)
        {
            throw new UnauthorizedError({ message: "Invalid OTP", info: { otp } });
        }

        existUser.confirmEmail = true;
        await existUser.save();

        return successObject(StatusCodeEnum.Accepted, "Email Confirmed", existUser);

    }


    public async resendConfirmEmail(email: string)
    {
        const existUser = await this._userRepo.findByEmail(email);
        if (!existUser)
        {
            throw new UnauthorizedError({ message: "Signup first", info: { email } });
        }

        if (existUser.confirmEmail)
        {
            throw new GoneError({ message: "Email already confirmed", info: { email } });
        }

        await this._mailService.sendEmailOTP({ user: { email, username: existUser.username }, reason: OtpTypesEnum.verifyEmail });

        return successObject(StatusCodeEnum.Accepted, "Check your Inbox", existUser);
    }

    public async sendResetPassword(email: string)
    {
        const existUser = await this._userRepo.findByEmail(email);

        if (!existUser)
        {
            throw new UnauthorizedError({ message: "Signup first", info: { email } });
        }

        if (!existUser.confirmEmail)
        {
            throw new ForbiddenError({ message: "Confirm your Email first", info: { email } });
        }

        await this._mailService.sendEmailOTP({
            user: { email: existUser.email, username: existUser.username },
            reason: OtpTypesEnum.resetPassword
        });

        return successObject(StatusCodeEnum.Accepted, "Check your inbox", existUser);
    }

    public async confirmResetPassword(bodyData: { email: string, otp: string; newPassword: string; })
    {
        const { email, otp, newPassword } = bodyData;

        const existUser = await this._userRepo.findOne({ email: email, confirmEmail: true }, "+password");
        if (!existUser)
        {
            throw new UnauthorizedError({ message: "Signup first", info: { email } });
        }

        console.log(existUser.password, newPassword.toString())

        if (!existUser.confirmEmail)
        {
            throw new ForbiddenError({ message: "Confirm your Email first", info: { email } });
        }

        const existOTP = await this._redisService.get(OTPKey(email, OtpTypesEnum.resetPassword));
        if (!existOTP)
        {
            throw new ForbiddenError({ message: "Expired OTP", info: { email } });
        }

        const isOTPValid = await compareHashes(existOTP, otp.toString());
        if (!isOTPValid)
        {
            throw new UnauthorizedError({ message: "Invalid OTP", info: { otp } });
        }


        if (await compareHashes(existUser.password, newPassword.toString()))
        {
            throw new ContentError({ message: "Use new Password", info: { newPassword } });
        }

        existUser.password = await hashingPassword(newPassword);
        await existUser.save();

        const { password, ...restUser } = existUser.toObject();

        return successObject(StatusCodeEnum.Accepted, "Password reset successfully", restUser);
    }

}


export default new AuthService();