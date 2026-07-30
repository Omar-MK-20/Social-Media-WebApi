import { model, Schema, Types } from "mongoose";
import { PrivacyEnum } from "../../util/enums/post.enums.js";
import type { IPost } from "../../util/interfaces/IPost.js";

const postSchema = new Schema<IPost>({
    content: {
        type: String,
        required: function (): boolean
        {
            return !this.attachments?.length;
        },
    },

    attachments: [{ type: String }],

    likes: [{ type: Types.ObjectId, ref: "User" }],
    tags: [{ type: Types.ObjectId, ref: "User" }],

    privacy: {
        type: Number,
        enum: PrivacyEnum,
        default: PrivacyEnum.Public
    },

    createdBy: { type: Types.ObjectId, ref: "User", required: true },

    deletedAt: Date,

}, {
    timestamps: true,
    toObject: { getters: true },
    toJSON: { getters: true }
});


postSchema.pre(["find", "findOne"], function ()
{
    const query = this.getQuery();
    const { isDeleted, ...restQuery } = query;

    if (query.isDeleted == true)
    {
        this.setQuery({ $or: [{ ...restQuery }, { $and: [{ ...restQuery }, { deletedAt: { $exists: true } }] }] });

    }
    else
    {
        this.setQuery({ ...restQuery, deletedAt: { $exists: false } });
    }
});

postSchema.pre("updateOne", function ()
{
    const updateQuery = this.getUpdate();

    //@ts-ignore
    const { delete: boolean, ...restUpdateQuery } = updateQuery;

    //@ts-ignore
    if (updateQuery?.delete == true)
    {
        // @ts-ignore
        this.setUpdate({ $set: { ...restUpdateQuery.$set, deletedAt: new Date() }, $setOnInsert: restUpdateQuery.$setOnInsert });
    }
    else
    {
        this.setUpdate({ ...restUpdateQuery });
    }
});


export const PostModel = model<IPost>("posts", postSchema);