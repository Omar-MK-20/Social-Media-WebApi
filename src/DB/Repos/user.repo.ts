import type { ProjectionType, QueryOptions } from "mongoose";
import { UserModel } from "../Models/user.model.js";
import { DBRepo } from "./db.repo.js";
import type { IUser } from "../../util/interfaces/IUser.js";

class UserRepo extends DBRepo<IUser>
{
    constructor()
    {
        super(UserModel);
    }

    public findByEmail({ email, isDeleted = false, projection, options }:
        {
            email: string;
            isDeleted?: boolean;
            projection?: ProjectionType<IUser> | null | undefined;
            options?: QueryOptions<IUser> & { lean: true; };
        })
    {
        return this.findOne({filter: {email}, isDeleted, projection, options});
    }

}

export default new UserRepo();