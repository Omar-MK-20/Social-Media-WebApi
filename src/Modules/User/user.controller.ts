import { Router } from "express";
import { AuthType, TokenType } from "../../util/enums/token.enums.js";
import { RoleEnum } from "../../util/enums/user.enums.js";
import type { IUser } from "../../util/interfaces/IUser.js";
import { authentication, authorization } from "../../util/middlewares/auth.middleware.js";
import { validation } from "../../util/middlewares/validation.middleware.js";
import { getSuccessObject, successResponse } from "../../util/res/ResponseObject.js";
import * as userService from "./user.service.js";
import { logoutSchema } from "./user.validation.js";

export const userRouter = Router();


userRouter.get("/",
    authentication(TokenType.access, AuthType.bearer),
    authorization(RoleEnum.User, RoleEnum.Admin),
    (req, res) =>
    {
        const result = getSuccessObject<IUser>(req.user);

        successResponse<IUser>(res, result);
    });



userRouter.post("/renew-token",
    authentication(TokenType.refresh, AuthType.bearer),
    authorization(RoleEnum.User, RoleEnum.Admin),
    async (req, res) =>
    {
        const result = await userService.renewToken(req.user, (req.payload.jti as string));

        return successResponse(res, result);
    });


// userRouter.get("/share-profile/:id",
//     authentication(TokenType.access, AuthType.bearer, { notRequired: true }),
//     expressSession(),
// validation(shareProfileSchema),
//     async (req, res) =>
//     {
//         const result = await userService.getSharedProfile(req.params.id as string, req.session, req.user);
//         return successResponse(res, result);
//     });


userRouter.post("/logout",
    authentication(TokenType.access, AuthType.bearer),
    authorization(RoleEnum.User, RoleEnum.Admin),
    validation(logoutSchema),
    async (req, res) =>
    {
        const result = await userService.logout({ userId: req.user.id, tokenData: req.payload, formAllDevices: req.valid.body.fromAllDevices });

        return successResponse(res, result);
    });
