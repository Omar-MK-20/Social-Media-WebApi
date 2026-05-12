import type { JwtPayload } from "jsonwebtoken";
import type { HUser } from "../interfaces/IUser.js";
import type express from "express";

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