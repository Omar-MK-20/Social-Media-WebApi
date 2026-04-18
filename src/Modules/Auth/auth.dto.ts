import z from "zod";
import { signupSchema } from "./auth.validation.js";

export type SignupDTO = z.infer<typeof signupSchema.body>;