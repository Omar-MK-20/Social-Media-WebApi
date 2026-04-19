import jwt, { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { TOKEN_SIGNATURE_ADMIN_ACCESS, TOKEN_SIGNATURE_ADMIN_REFRESH, TOKEN_SIGNATURE_USER_ACCESS, TOKEN_SIGNATURE_USER_REFRESH } from "../../app.config.js";
import { AuthType, TokenType } from "../enums/token.enums.js";
import { RoleEnum } from "../enums/user.enums.js";
import type { ITokenPayload } from "../interfaces/ITokenPayload.js";
import { ContentError, UnauthorizedError } from "../res/ResponseError.js";


export function tokenGenerator(userData: { id: string, email: string, role: RoleEnum; }, tokenType: string)
{
    const { refreshSignature, accessSignature } = getSignature(userData.role);

    const signature = tokenType == TokenType.access ? accessSignature : refreshSignature;
    const expiresIn = tokenType == TokenType.access ? "10m" : "1y";

    const token = jwt.sign({ ...userData, tokenType }, signature, { expiresIn: expiresIn });

    return token;
}


export function verifyToken(desiredAuthType: AuthType, authorization: string, desiredTokenType: TokenType)
{
    try
    {
        const [authType, token] = authorization.split(" ");

        if (desiredAuthType != authType)
        {
            throw new UnauthorizedError({ message: "you are not authorized", info: { authorization } });
        }

        if (!token) throw new ContentError({ message: "token is required" });

        const decoded = jwt.decode(token) as ITokenPayload;

        const { accessSignature, refreshSignature } = getSignature(decoded.role);

        const signature = desiredTokenType == TokenType.access ? accessSignature : refreshSignature;

        const data = jwt.verify(token, signature, { complete: true });
        return data;
    }
    catch (error) 
    {
        if (error instanceof TokenExpiredError)
        {
            throw new UnauthorizedError({ message: "token expired", info: { error } });
        }

        if (error instanceof JsonWebTokenError)
        {
            throw new ContentError({ message: error.message, info: { error } });
        }

        throw error;
    }
}



export function getSignature(userRole: RoleEnum)
{
    let refreshSignature: Buffer;
    let accessSignature: Buffer;

    switch (userRole)
    {
        case RoleEnum.Admin:
            accessSignature = Buffer.from(TOKEN_SIGNATURE_ADMIN_ACCESS || "", "hex");
            refreshSignature = Buffer.from(TOKEN_SIGNATURE_ADMIN_REFRESH || "", "hex");
            break;

        case RoleEnum.User:
            accessSignature = Buffer.from(TOKEN_SIGNATURE_USER_ACCESS || "", "hex");
            refreshSignature = Buffer.from(TOKEN_SIGNATURE_USER_REFRESH || "", "hex");
            break;
    }

    return { refreshSignature, accessSignature };
}