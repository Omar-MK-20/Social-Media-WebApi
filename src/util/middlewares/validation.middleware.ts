import type { NextFunction, Request, Response } from "express";
import z, { ZodArray, ZodObject } from "zod";
import type { $ZodIssue } from "zod/v4/core";
import { MIME_TYPES, StorageType } from "../enums/file.enums.js";
import { GenderEnum, RoleEnum } from "../enums/user.enums.js";
import { ContentError } from "../res/ResponseError.js";

export type ReqKey = keyof Request;

export function validation(validationSchema: Partial<Record<ReqKey, ZodObject | ZodArray>>)
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


export class ValidationType
{
    private constructor() { }
    static id = z
        .string({ error: "id is required" })
        .regex(/^[0-9a-fA-F]{24}$/, { error: "invalid id" });
    static id2 = z.hex().max(24).min(24);
    static username = z.string().min(3).max(50);
    static email = z.email();
    static password = z.string().regex(passwordRegExp);
    static DOB = z.date();
    static gender = z.enum(GenderEnum).default(GenderEnum.Male);
    static confirmEmail = z.boolean().default(false);
    static phone = z.string().regex(phoneRegExp);
    static role = z.enum(RoleEnum).default(RoleEnum.User);
    static profilePic = z.string();
    static coverPics = z.array(z.string());
    static fromAllDevices = z.boolean();
    static otp = z.number().min(100000).max(999999);
    private static memoryFile = z.object({
        fieldname: z.string(),
        originalname: z.string(),
        encoding: z.string(),
        mimetype: z.enum(MIME_TYPES),
        buffer: z.instanceof(Buffer),
        size: z.number(),
    });
    private static diskFile = z.object({
        fieldname: z.string(),
        originalname: z.string(),
        encoding: z.string(),
        mimetype: z.enum(MIME_TYPES),
        destination: z.string(),
        filename: z.string(),
        path: z.string(),
        size: z.number(),
    });
    static file(storageType: StorageType)
    {
        return storageType === StorageType.Memory
            ? this.memoryFile
            : this.diskFile;
    }
}