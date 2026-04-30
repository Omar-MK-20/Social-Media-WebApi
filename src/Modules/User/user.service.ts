import type { Session } from "express-session";
import type { JwtPayload } from "jsonwebtoken";
import redisRepo from "../../DB/Redis/redis.service.js";
import userRepo from "../../DB/Repos/user.repo.js";
import { TokenType } from "../../util/enums/token.enums.js";
import { RoleEnum } from "../../util/enums/user.enums.js";
import { blockedTokenKey } from "../../util/helpers/token.funcs.js";
import type { HUser, } from "../../util/interfaces/IUser.js";
import { NotFoundError } from "../../util/res/ResponseError.js";
import { getSuccessObject, successObject } from "../../util/res/ResponseObject.js";
import tokenService from "../../util/security/token.service.js";


class UserService
{

    private _userRepo = userRepo;
    private _tokenService = tokenService;

    constructor() { }

    public async renewToken(userData: HUser, tokenId: string)
    {

        const accessToken = this._tokenService.generateToken(
            {
                id: userData.id,
                email: userData.email,
                role: userData.role
            }, TokenType.access, tokenId);

        return getSuccessObject({ ...userData.toObject(), accessToken });
    }


    public async getSharedProfile(profileId: string, session: Session & { firstTry: boolean; }, userData: HUser)
    {
        const existUser = await this._userRepo.findById(profileId, "-role -confirmEmail -createdAt -updatedAt -__v -provider -galleries");

        if (!existUser)
        {
            throw new NotFoundError({ message: "user not found", info: { id: profileId } });
        }

        if (session.firstTry == undefined) session.firstTry = true;

        if (session.firstTry)
        {
            if (existUser.views == undefined)
            {
                existUser.views = 0;
            }
            existUser.views++;
            await existUser.save();

            session.firstTry = false;
        }

        if (userData?.role == RoleEnum.Admin)
        {
            return getSuccessObject(existUser);
        }

        const { views, ...restData } = existUser.toObject();
        return getSuccessObject(restData);
    }


    public async logout({ userId, tokenData, formAllDevices }: { userId: string; tokenData: JwtPayload; formAllDevices: boolean; })
    {

        // logout from all devices (by changing the changeCreditTime property)
        if (formAllDevices == true)
        {
            await this._userRepo.updateOne({ _id: userId }, { $set: { changeCreditTime: new Date() } });
            return successObject(200, "Logged out from all devices successfully", undefined);
        }
        // logout from single device (by blocking the token)
        else
        {
            await redisRepo.set({
                key: blockedTokenKey(userId, tokenData.jti as string),
                value: 0,
                exValue: Math.floor((60 * 60 * 24 * 365) - (Date.now() / 1000 - (tokenData.iat as number)))
            });
            return successObject(200, "Logged out successfully", undefined);
        }
    }
}


export default new UserService();