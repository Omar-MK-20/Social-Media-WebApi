import type { Types } from "mongoose";
import { UserModel } from "../../DB/Models/user.model.js";
import { ConflictError } from "../../util/res/ResponseError.js";
import { createSuccessObject } from "../../util/res/ResponseObject.js";

export async function signup(bodyData: { username: string; password: string; email: string; })
{
    const { email } = bodyData;

    const existEmail = await UserModel.findOne({ email: email });
    if (existEmail)
    {
        throw new ConflictError({ message: "Email already exist" });
    }

    const { password, ...result } = (await UserModel.create(bodyData)).toObject();

    return createSuccessObject<{
        username: string;
        email: string;
        _id: Types.ObjectId;
        __v: number;
    }>("User", result);

}