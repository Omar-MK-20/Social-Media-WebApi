import z from "zod";
import { confirmEmailSchema, confirmResetPasswordSchema, loginSchema, signupSchema } from "./auth.validation.js";

export type SignupDTO = z.infer<typeof signupSchema.body>;
export type LoginDTO = z.infer<typeof loginSchema.body>;
export type confirmEmailDTO = z.infer<typeof confirmEmailSchema.body>;
export type confirmResetPasswordDTO = z.infer<typeof confirmResetPasswordSchema.body>;