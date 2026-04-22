import { Router } from "express";
import { AuthType, TokenType } from "../../util/enums/token.enums.js";
import { RoleEnum } from "../../util/enums/user.enums.js";
import type { IUser } from "../../util/interfaces/IUser.js";
import { authentication, authorization } from "../../util/middlewares/auth.middleware.js";
import { getSuccessObject, successResponse } from "../../util/res/ResponseObject.js";


export const userRouter = Router();


userRouter.get("/",
    authentication(TokenType.access, AuthType.bearer),
    authorization(RoleEnum.User, RoleEnum.Admin),
    (req, res) =>
    {
        const result = getSuccessObject<IUser>(req.user);

        successResponse<IUser>(res, result);
    });