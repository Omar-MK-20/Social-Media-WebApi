import z from "zod";
import { ValidationType } from "../../util/middlewares/validation.middleware.js";

export const signupSchema = {
    body: z.object({
        username: ValidationType.username,
        email: ValidationType.email,
        password: ValidationType.password,
        DOB: ValidationType.DOB.optional(),
        gender: ValidationType.gender.optional(),
        phone: ValidationType.phone.optional(),
        profilePic: ValidationType.profilePic.optional(),
        coverPics: ValidationType.coverPics.optional(),
    })
};

export const loginSchema = {
    body: z.object({
        email: ValidationType.email,
        password: ValidationType.password
    })
};