import { UserModel } from "../../DB/Models/user.model.js";
import userRepo from "../../DB/Repos/user.repo.js";
import { TokenType } from "../../util/enums/token.enums.js";
import { ConflictError, UnauthorizedError } from "../../util/res/ResponseError.js";
import { createSuccessObject, successObject } from "../../util/res/ResponseObject.js";
import { encrypt } from "../../util/security/encryption.js";
import { compareHashes, hashingPassword } from "../../util/security/hashing.js";
import { generateToken } from "../../util/security/token.js";
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
    // const { password, ...result } = (await UserModel.create(bodyData)).toObject();
    const { password, ...result } = (await userRepo.create(bodyData)).toObject();

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

    const accessToken: string = generateToken({ id: user._id, email: user.email, role: user.role }, TokenType.access);
    const refreshToken: string = generateToken({ id: user._id, email: user.email, role: user.role }, TokenType.refresh);

    return successObject(200, `${user.username} Logged in successfully`, { ...user, accessToken, refreshToken });

}