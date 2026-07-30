import z from "zod";
import { PrivacyEnum } from "../../util/enums/post.enums.js";

export const createPostSchema = {
    body: z.object({
        content: z.string().optional(),
        files: z.array(z.any()).optional(),
        tags: z.array(z.string()).optional(),
        privacy: z.enum(PrivacyEnum).default(PrivacyEnum.Public),
    }).superRefine((args, ctx) =>
    {
        if (!args.files?.length && !args.content)
        {
            ctx.addIssue({
                code: "custom",
                path: ["content"],
                message: "Content or Files required"
            });
        }
    })
};