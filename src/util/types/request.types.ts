import type { IUser } from "../interfaces/IUser.js";


declare global
{
    namespace Express
    {
        interface Request
        {
            valid: Record<string, any>;
            user: IUser;
        }
    }
}