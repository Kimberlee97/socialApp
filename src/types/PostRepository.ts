import {Post} from "./posts";

export interface PostRepository {
    fetchAll(): Promise<Post[]>;
    create(post: Post): Promise<void>;
}
