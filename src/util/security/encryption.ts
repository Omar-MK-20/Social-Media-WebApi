import { ALGORITHM, ENCRYPTION_SECRET_KEY } from "../../app.config.js";
import { ResponseError } from "../res/ResponseError.js";
import { StatusCodeEnum } from "../types/ResponseTypes.js";

import crypto from "node:crypto";

const secretKey: Buffer = Buffer.from(ENCRYPTION_SECRET_KEY);

if (secretKey.length !== 32)
{
    throw new ResponseError("SECRET_KEY must be 32 bytes (64 hex characters)", StatusCodeEnum.ServerError, secretKey);
}

// export function encrypt(data: string): string
// {
//     try
//     {
//         const iv = crypto.randomBytes(12);
//         const cipher = crypto.createCipheriv("aes-256-gcm", secretKey, iv);

//         let encryptedData = cipher.update(data, "utf-8", "hex");
//         encryptedData += cipher.final("hex");
//         const authTag = cipher.getAuthTag();
//     }
//     catch (error)
//     {

//     }
// }
