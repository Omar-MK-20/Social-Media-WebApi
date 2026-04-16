import { Router } from "express";
import { createSuccessObject, successResponse } from "../../util/res/ResponseObject.js";


export const authRouter = Router();

authRouter.post("/signup", (req, res) =>
{
    const result = createSuccessObject<string>("user", "result");

    successResponse(res, result);
});