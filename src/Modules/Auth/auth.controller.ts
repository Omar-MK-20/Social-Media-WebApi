import { Router } from "express";
import { createSuccessObject, successResponse } from "../../util/res/ResponseObject.js";
import * as authService from "./auth.service.js";



export const authRouter = Router();

authRouter.post("/signup", async (req, res) =>
{
    const result = await authService.signup(req.body);

    successResponse(res, result);
});