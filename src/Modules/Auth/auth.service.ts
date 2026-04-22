import userRepo from "../../DB/Repos/user.repo.js";
import { OtpTypesEnum } from "../../util/enums/otp.enums.js";
import { TokenType } from "../../util/enums/token.enums.js";
import { sendMail } from "../../util/nodemailer/mail.config.js";
import { ConflictError, UnauthorizedError } from "../../util/res/ResponseError.js";
import { createSuccessObject, successObject } from "../../util/res/ResponseObject.js";
import { encrypt } from "../../util/security/encryption.js";
import { compareHashes, hashingPassword } from "../../util/security/hashing.js";
import { generateOTP } from "../../util/security/otp.js";
import TokenService from "../../util/security/token.service.js";
import type { LoginDTO, SignupDTO } from "./auth.dto.js";

export async function signup(bodyData: SignupDTO)
{
    const { email } = bodyData;

    const existEmail = await userRepo.findByEmail(email);
    if (existEmail)
    {
        throw new ConflictError({ message: "Email already exist" });
    }

    bodyData.password = await hashingPassword(bodyData.password);

    if (bodyData.phone) bodyData.phone = encrypt(bodyData.phone);

    const { password, ...result } = (await userRepo.create(bodyData)).toObject();

    const otp = generateOTP();

    // Question isn't it better to remove await, so it sends an email in the background?
    await sendMail({ email: result.email, username: result.username, reason: OtpTypesEnum.verifyEmail, otp: otp, });

    return createSuccessObject("User", result);
}


export async function login(bodyData: LoginDTO)
{

    const existUser = await userRepo.findByEmail(bodyData.email, "+password");
    console.log(existUser);
    if (!existUser)
    {
        throw new UnauthorizedError({ message: "Invalid Email or Password", info: { bodyData } });
    }

    const isPasswordCorrect = await compareHashes(existUser.password, bodyData.password);
    if (!isPasswordCorrect)
    {
        throw new UnauthorizedError({ message: "Invalid Email or Password", info: { bodyData } });
    }

    const { password, ...user } = existUser.toObject();

    const accessToken: string = TokenService.generateToken({ id: user._id, email: user.email, role: user.role }, TokenType.access);
    const refreshToken: string = TokenService.generateToken({ id: user._id, email: user.email, role: user.role }, TokenType.refresh);

    return successObject(200, `${user.username} Logged in successfully`, { ...user, accessToken, refreshToken });

}