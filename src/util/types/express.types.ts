import type express from "express";
import type { JwtPayload } from "jsonwebtoken";
import type { HUser } from "../interfaces/IUser.js";


export type TExpress = ReturnType<typeof express>;

declare global
{
    namespace Express
    {
        interface Request
        {
            valid: Record<string, any>;
            user: HUser;
            payload: JwtPayload;
        }
    }
}

declare module 'express-session' {
    interface SessionData
    {
        firstTry: boolean;
    }
}