import z from "zod";
import { loginSchema, signupSchema } from "./auth.validation.js";

export type SignupDTO = z.infer<typeof signupSchema.body>;
export type LoginDTO = z.infer<typeof loginSchema.body>;