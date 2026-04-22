import type { Request, Response, NextFunction } from "express";
import { AuthType, TokenType } from "../enums/token.enums.js";
import { ContentError, ForbiddenError, UnauthorizedError } from "../res/ResponseError.js";
import TokenService from "../security/token.service.js";
import userRepo from "../../DB/Repos/user.repo.js";
import type { RoleEnum } from "../enums/user.enums.js";


export function authentication(tokenType = TokenType.access, authType = AuthType.bearer, { notRequired = false }: { notRequired?: boolean; } = {})
{
    return async (req: Request, res: Response, next: NextFunction) =>
    {
        const { authorization } = req.headers;

        if (!authorization)
        {
            if (notRequired == true)
            {
                return next();
            }
            throw new ContentError({ message: "token is required", info: { authorization } });
        }

        const payload = TokenService.verifyToken(authType, authorization, tokenType);

        if (typeof payload == "string") { throw new ContentError({ message: "Invalid Token data", info: { payload } }); }

        const result = await userRepo.findById(payload.id);
        if (!result)
        {
            throw new UnauthorizedError({ message: "user not found, signup first" });
        }

        req.user = result;
        next();
    };
}


export function authorization(...roles: RoleEnum[])
{
    return (req: Request, res: Response, next: NextFunction) =>
    {
        if (!roles.includes(req.user.role))
        {
            throw new ForbiddenError({ message: "You don't have access to this API", info: { role: req.user.role } });
        }

        next();
    };
}