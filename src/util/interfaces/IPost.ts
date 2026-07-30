import type { HydratedDocument } from "mongoose";
import { Types } from "mongoose";
import type { PrivacyEnum } from "../enums/post.enums.js";

export interface IPost
{
    content?: string;
    attachments?: string[];

    likes?: Types.ObjectId[];
    tags?: Types.ObjectId[];
    createdBy: Types.ObjectId;

    privacy: PrivacyEnum;

    deletedAt?: Date;
}


export type HPost = HydratedDocument<IPost>;
