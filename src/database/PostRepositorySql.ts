import {Post} from "../types/posts";
import {getDB} from "../database/connection";
import {PostRepository} from "../types/PostRepository";

export const PostRepositorySql: PostRepository = {
    fetchAll: async (): Promise<Post[]> => {
        const db = await getDB();
        const result = await db.getAllAsync<Post>(
            'SELECT * FROM posts ORDER BY id DESC'
        );
        return result;
    },

    create: async (post) => {
        const db = await getDB();
        await db.runAsync(
            'INSERT INTO posts (title, author, description, image) VALUES (?, ?, ?, ?)',
            [post.title, post.author, post.description ?? null, post.image ?? null]
        )
    }
}