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

        const user = await userRepo.findById(payload.id);
        if (!user)
        {
            throw new UnauthorizedError({ message: "user not found, signup first" });
        }


        // logout from all devices (by changing the changeCreditTime property)
        if (user.changeCreditTime && payload.iat)
        {
            if (user.changeCreditTime.getTime() > (payload.iat * 1000))
            {
                throw new UnauthorizedError({ message: "You need to login" });
            }
        }

        req.user = user;
        req.payload = payload;

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