import { Router } from "express";
import { successResponse } from "../../util/res/ResponseObject.js";
import * as authService from "./auth.service.js";
import { validation } from "../../util/middlewares/validation.middleware.js";
import { signupSchema } from "./auth.validation.js";



export const authRouter = Router();

authRouter.post("/signup",
    validation(signupSchema),
    async (req, res) =>
    {
        const result = await authService.signup(req.body);

        successResponse(res, result);
    });