import type { NextFunction, Request, Response } from "express";
import z, { ZodObject } from "zod";
import type { $ZodIssue } from "zod/v4/core";
import { MIME_TYPES } from "../enums/file.enums.js";
import { GenderEnum, RoleEnum } from "../enums/user.enums.js";
import { ContentError } from "../res/ResponseError.js";

export type ReqKey = keyof Request;

export function validation(validationSchema: Partial<Record<ReqKey, ZodObject>>)
{
    return (req: Request, res: Response, next: NextFunction) =>
    {
        let validationError: $ZodIssue[] = [];
        req.valid = {};

        for (const key in validationSchema)
        {
            // TODO solve `as ReqKey`
            const result = validationSchema[key as ReqKey]!.safeParse(req[key as ReqKey]);
            if (!result.success)
            {
                validationError.push(...result.error.issues);
                continue;
            }
            req.valid[key] = result.data;
        }

        if (validationError.length > 0)
        {
            throw new ContentError({ message: "Invalid Data", info: validationError });
        }

        next();
    };
}




const passwordRegExp = /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^\w\d\s:])([^\s]){8,16}$/;
const phoneRegExp = /^01[0125][0-9]{8}$/;


export const ValidationType = {
    id: z.string({ error: "id is required" })
        .regex(/^[0-9a-fA-F]{24}$/, { error: "invalid id" }),
    username: z.string().min(3).max(50),
    email: z.email(),
    password: z.string().regex(passwordRegExp),
    DOB: z.date(),
    gender: z.enum(GenderEnum).default(GenderEnum.Male),
    confirmEmail: z.boolean().default(false),
    phone: z.string().regex(phoneRegExp),
    role: z.enum(RoleEnum).default(RoleEnum.User),
    profilePic: z.string(),
    coverPics: z.array(z.string()),
    fromAllDevices: z.boolean(),
    otp: z.number().min(100000).max(999999),
    memoryFile: z.object({
        fieldname: z.string(),
        originalname: z.string(),
        encoding: z.string(),
        mimetype: z.enum(MIME_TYPES),
        buffer: z.instanceof(Buffer),
        size: z.number(),
    })
};