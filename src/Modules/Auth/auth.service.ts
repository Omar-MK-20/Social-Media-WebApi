import { UserModel } from "../../DB/Models/user.model.js";
import UserRepo from "../../DB/Repos/user.repo.js";
import { ConflictError } from "../../util/res/ResponseError.js";
import { createSuccessObject } from "../../util/res/ResponseObject.js";
import type { SignupDTO } from "./auth.dto.js";

export async function signup(bodyData: SignupDTO)
{
    const { email } = bodyData;

    const existEmail = await UserRepo.findByEmail(email);
    if (existEmail)
    {
        throw new ConflictError({ message: "Email already exist" });
    }


    // TODO password hashing
    // TODO phone encryptions


    const { password, ...result } = (await UserModel.create(bodyData)).toObject();

    return createSuccessObject("User", result);

}