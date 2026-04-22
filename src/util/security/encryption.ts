import crypto, { type CipherGCM } from "node:crypto";
import { ENCRYPTION_SECRET_KEY } from "../../app.config.js";
import { ResponseError } from "../res/ResponseError.js";
import { StatusCodeEnum } from "../types/ResponseTypes.js";

export type TEncrypt = `${string}:${string}:${string}`;

const algorithm = "aes-256-gcm";

const secretKey: Buffer = Buffer.from(ENCRYPTION_SECRET_KEY, "hex");

if (secretKey.length !== 32)
{
    throw new ResponseError("SECRET_KEY must be 32 bytes (64 hex characters)", StatusCodeEnum.ServerError, secretKey);
}

export function encrypt(data: string): TEncrypt
{
    try
    {
        const iv = crypto.randomBytes(12);
        const cipher: CipherGCM = crypto.createCipheriv(algorithm, secretKey, iv);

        let encryptedData = cipher.update(data, "utf-8", "hex");
        encryptedData += cipher.final("hex");
        const authTag = cipher.getAuthTag();

        return `${encryptedData}:${iv.toString("hex")}:${authTag.toString("hex")}`;
    }
    catch (error)
    {
        throw new ResponseError("error encrypting user's data", StatusCodeEnum.ServerError, { error });
    }
}

export function decrypt(data: TEncrypt): string
{
    try
    {
        const [encryptedData, iv, authTag] = data.split(":");
        console.log([encryptedData, iv, authTag]);

        if (!encryptedData)
        {
            throw new ResponseError("Error getting EncryptedData from string", StatusCodeEnum.ServerError, { data });
        }

        if (!authTag)
        {
            throw new ResponseError("Error getting AuthTag from string", StatusCodeEnum.ServerError, { data });
        }

        if (!iv)
        {
            throw new ResponseError("Error getting Initialization Vector from string", StatusCodeEnum.ServerError, { data });
        }

        const decipher = crypto.createDecipheriv(algorithm, secretKey, Buffer.from(iv, "hex"));

        decipher.setAuthTag(Buffer.from(authTag, "hex"));

        let decryptedData = decipher.update(encryptedData, "hex", "utf-8");
        decryptedData += decipher.final("utf-8");

        return decryptedData;
    }
    catch (error)
    {
        throw new ResponseError("Error decrypting user's data", StatusCodeEnum.ServerError, { error });

    }
}