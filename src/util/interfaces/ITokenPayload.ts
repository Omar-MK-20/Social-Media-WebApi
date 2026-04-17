import type { JwtPayload } from "jsonwebtoken";
import type { UserRole } from "../enums/user.enums.js";

export interface ITokenPayload extends JwtPayload
{
    id: string;
    email: string;
    role: UserRole;
}