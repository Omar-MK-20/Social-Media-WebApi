import type z from "zod";
import { createPostSchema } from "./post.validation.js";


export type createPostDTO = z.infer<typeof createPostSchema.body>;
