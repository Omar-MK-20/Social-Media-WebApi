import type { JwtPayload } from "jsonwebtoken";
import type { RoleEnum } from "../enums/user.enums.js";

export interface ITokenPayload extends JwtPayload
{
    id: string;
    email: string;
    role: RoleEnum;
}