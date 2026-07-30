import { Types } from "mongoose";
import redisService from "../../DB/Redis/redis.service.js";
import postRepo from "../../DB/Repos/post.repo.js";
import userRepo from "../../DB/Repos/user.repo.js";
import { FCMTokenKey } from "../../util/helpers/token.funcs.js";
import { BadRequestError } from "../../util/res/ResponseError.js";
import type { createPostDTO } from "./post.dto.js";
import { createSuccessObject } from "../../util/res/ResponseObject.js";
import type { HPost } from "../../util/interfaces/IPost.js";


class PostService
{

    private _userRep = userRepo;
    private _postRepo = postRepo;
    private _redisService = redisService;
    private _S3BucketService: any;
    private _notificationService: any;

    constructor() { }

    async createPost(
        /**
         * hover the mouse above 'createPostDTO' you should see this type
         * type createPostDTO = {
         * privacy: PrivacyEnum;
         * content?: string | undefined;
         * files?: any[] | undefined;
         * tags?: string[] | undefined;
         * }
         */
        BodyData: createPostDTO, // adding 'createPostDTO' instead of 'any'
        userId: Types.ObjectId | string,
        files?: Express.Multer.File[],
    )
    {

        // create instance of Post Model with the mandatory data only
        const newPost = this._postRepo.getDBDoc({
            createdBy: userId as Types.ObjectId,
            privacy: BodyData.privacy,
        });

        // extracting tags from BodyData
        const { tags } = BodyData; // tags: string[] | undefined

        // check if there is tags in post or not
        if (tags?.length)
        {
            // if there is tags => check if they are valid users or not
            const MentionedUsers = await this._userRep.find({
                filter: { _id: { $in: tags } },
            });

            // if there is one user missing => throw an exception
            if (MentionedUsers?.length != tags?.length)
            {
                throw new BadRequestError({ message: " Failed to find some tagged Users" });
            }

            // tags are array of string, so i converted it to array of 'ObjectId' using 'map'
            const tagsAsObjectId = BodyData.tags?.map(tag => new Types.ObjectId(tag));
            // adding tags to the 'newPost' instance created previously
            newPost.tags = tagsAsObjectId as Types.ObjectId[];
        }

        // check if there is files uploaded
        if (files?.length)
        {
            const filesPaths = await this._S3BucketService.UploadFiles({
                files: files as Express.Multer.File[],
                path: `/post/${newPost?._id}`,
            });

            // add uploaded files paths to the 'newPost' instance created previously 
            newPost.attachments = filesPaths;
        }


        // for each tag exist send notifications
        for (const tag of tags! || [])
        {
            const FCMToken = await this._redisService.get(FCMTokenKey(tag));
            if (FCMToken?.length)
            {
                await this._notificationService.sendNotifications({
                    tokens: FCMToken,
                    data: {
                        title: "Post Tagged",
                        body: JSON.stringify({
                            postId: newPost._id,
                            message: "you have been tagged",
                        }),
                    },
                });
            }
        }


        /**
         * add the logged in userId to the 'newPost'
         * this line is not necessary as i already add it above as shown in the next comment
         * 
         * const newPost = this._postRepo.getDBDoc({
         * createdBy: userId as Types.ObjectId,
         * privacy: BodyData.privacy,
         * });
         */
        newPost.createdBy = userId as Types.ObjectId;

        // saving the 'newPost' instance to Database
        await this._postRepo.saveDBDoc(newPost);
        return createSuccessObject("Post", newPost);

    }

}


export default new PostService();