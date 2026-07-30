import type { IPost } from "../../util/interfaces/IPost.js";
import { PostModel } from "../Models/post.model.js";
import { DBRepo } from "./db.repo.js";

class PostRepo extends DBRepo<IPost>
{
    constructor()
    {
        super(PostModel);
    }

}

export default new PostRepo();