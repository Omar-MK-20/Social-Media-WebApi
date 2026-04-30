import type { Types } from "mongoose";
import { randomUUID } from "node:crypto";
import { OtpTypesEnum } from "../../util/enums/otp.enums.js";
import { TokenType } from "../../util/enums/token.enums.js";
import { GenderEnum, ProviderEnum, RoleEnum } from "../../util/enums/user.enums.js";
import { sendMail } from "../../util/nodemailer/mail.config.js";
import { ConflictError, ContentError, UnauthorizedError } from "../../util/res/ResponseError.js";
import { successObject } from "../../util/res/ResponseObject.js";
import { encrypt, type TEncrypt } from "../../util/security/encryption.js";
import { verifyGoogleAuth } from "../../util/security/googleOAuth.js";
import { compareHashes, hashingPassword } from "../../util/security/hashing.js";
import { generateOTP } from "../../util/security/otp.js";
import type { TResponseObject } from "../../util/types/ResponseTypes.js";
import type { LoginDTO, SignupDTO } from "./auth.dto.js";
import userRepo from "../../DB/Repos/user.repo.js";
import tokenService from "../../util/security/token.service.js";



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

        const otp = generateOTP();

        // Question isn't it better to remove await, so it sends an email in the background?
        await sendMail({ email: result.email, username: result.username, reason: OtpTypesEnum.verifyEmail, otp: otp, });

        // return createSuccessObject("User", result);
        return successObject(201, "Check your inbox", result);
    }


    public async login(bodyData: LoginDTO)
    {

        const existUser = await this._userRepo.findByEmail(bodyData.email, "+password");
        console.log(existUser);
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


    public async confirmEmail()
    {

    }


}


export default new AuthService();