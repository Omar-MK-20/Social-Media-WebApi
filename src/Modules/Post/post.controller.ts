import { Router } from "express";
import { authentication, authorization } from "../../util/middlewares/auth.middleware.js";
import { validation } from "../../util/middlewares/validation.middleware.js";
import { successResponse } from "../../util/res/ResponseObject.js";
import postService from "./post.service.js";
import { createPostSchema } from "./post.validation.js";

export const postRouter = Router();

postRouter.post("/create-post",
    authentication(),
    authorization(),
    validation(createPostSchema),
    async (req, res) =>
    {
        const result = await postService.createPost(req.valid.body, req.user.id, req.files as Express.Multer.File[]);
        return successResponse(res, result);
    }
);