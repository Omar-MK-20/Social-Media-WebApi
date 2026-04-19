import bcrypt from "bcrypt";
import { ResponseError } from "../res/ResponseError.js";
import { StatusCodeEnum } from "../types/ResponseTypes.js";

export async function hashingPassword(password: string): Promise<string>
{
    try
    {
        const saltRounds = 12;
        const hash = await bcrypt.hash(password, saltRounds);
        return hash;
    }
    catch (error)
    {
        throw new ResponseError("Error hashing user's password", StatusCodeEnum.ServerError, { error });
    }
}


export async function compareHashes(hashedPassword: string, password: string): Promise<boolean>
{
    try
    {
        return await bcrypt.compare(password, hashedPassword);
    }
    catch (error)
    {
        throw new ResponseError("Password comparison failed", StatusCodeEnum.ServerError, { error });
    }
}
