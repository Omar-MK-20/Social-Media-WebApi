import { Router } from "express";
import { validation } from "../../util/middlewares/validation.middleware.js";
import { successResponse } from "../../util/res/ResponseObject.js";
import { confirmEmailSchema, confirmResetPasswordSchema, loginSchema, resendConfirmEmailSchema, sendResetPasswordSchema, signupSchema } from "./auth.validation.js";
import { ContentError } from "../../util/res/ResponseError.js";
import authService from "./auth.service.js";



export const authRouter = Router();

authRouter.post("/signup",
    validation(signupSchema),
    async (req, res) =>
    {
        const result = await authService.signup(req.valid.body);

        successResponse(res, result);
    });


authRouter.post("/login",
    validation(loginSchema),
    async (req, res) =>
    {
        const result = await authService.login(req.valid.body);

        successResponse(res, result);
    }
);

authRouter.post("/signup/gmail", async (req, res) =>
{
    let idToken;
    if (req.body?.idToken)
    {
        idToken = req.body.idToken;
    }
    else
    {
        idToken = req.headers.authorization;
    }

    if (idToken == undefined)
    {
        throw new ContentError({ message: "idToken in required" });
    }

    const result = await authService.signupWithGoogle(idToken);

    return successResponse(res, result);
});

authRouter.post("/login/gmail", async (req, res) =>
{
    let idToken;
    if (req.body?.idToken)
    {
        idToken = req.body.idToken;
    }
    else
    {
        idToken = req.headers.authorization;
    }

    if (idToken == undefined)
    {
        throw new ContentError({ message: "idToken in required" });
    }

    const result = await authService.loginWithGoogle(idToken);

    return successResponse(res, result);
});


authRouter.post("/confirm-email",
    validation(confirmEmailSchema),
    async (req, res) =>
    {
        console.log(req.body);
        const result = await authService.confirmEmail(req.valid.body);
        return successResponse(res, result);
    }
);


authRouter.post("/resend-confirm-email",
    validation(resendConfirmEmailSchema),
    async (req, res) =>
    {
        const result = await authService.resendConfirmEmail(req.valid.body.email);
        return successResponse(res, result);
    }
);


authRouter.post("/send-reset-password",
    validation(sendResetPasswordSchema),
    async (req, res) =>
    {
        const result = await authService.sendResetPassword(req.valid.body.email);
        return successResponse(res, result);
    }
);


authRouter.post("/confirm-reset-password",
    validation(confirmResetPasswordSchema),
    async (req, res) =>
    {
        console.log(req.body);
        const result = await authService.confirmResetPassword(req.valid.body);
        return successResponse(res, result);
    }
);