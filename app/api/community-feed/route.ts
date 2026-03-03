import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const db = await getDb();

        // Fetch posts and sort by newest
        const postsCursor = db.collection("posts").find().sort({ created_at: -1 });
        const postsArray = await postsCursor.toArray();

        // Fetch user profiles for posts
        const userIds = Array.from(new Set(postsArray.map(p => p.user_id?.toString()).filter(Boolean)));
        const usersCursor = db.collection("users").find({ _id: { $in: userIds.map((id: string) => new ObjectId(id)) } });
        const usersArray = await usersCursor.toArray();

        const userMap: Record<string, any> = {};
        usersArray.forEach(u => {
            userMap[u._id.toString()] = {
                id: u._id.toString(),
                username: u.name || "Anonymous",
                profile_image_url: u.avatar_url || ""
            };
        });

        // Map posts to expected frontend format
        const formattedPosts = postsArray.map(p => ({
            id: p._id.toString(),
            image_url: p.image_data || p.image_url,
            description: p.description || "",
            profiles: p.user_id ? userMap[p.user_id.toString()] : null
        }));

        // Fetch likes
        const likesCursor = db.collection("post_likes").find();
        const likesArray = await likesCursor.toArray();
        const likesMap: Record<string, number> = {};
        likesArray.forEach(l => {
            const pId = l.post_id;
            likesMap[pId] = (likesMap[pId] || 0) + 1;
        });

        // Fetch comments
        const commentsCursor = db.collection("post_comments").find().sort({ created_at: 1 });
        const commentsArray = await commentsCursor.toArray();

        // Fetch remaining users for comments
        const commentUserIds = Array.from(new Set(commentsArray.map(c => c.user_id?.toString()).filter(Boolean)));
        const remainingUserIds = commentUserIds.filter(id => !userMap[id as string]);
        if (remainingUserIds.length > 0) {
            const moreUsersC = db.collection("users").find({ _id: { $in: remainingUserIds.map((id: string) => new ObjectId(id)) } });
            const moreUsersA = await moreUsersC.toArray();
            moreUsersA.forEach(u => {
                userMap[u._id.toString()] = {
                    id: u._id.toString(),
                    username: u.name || "Anonymous",
                    profile_image_url: u.avatar_url || ""
                };
            });
        }

        const commentsMap: Record<string, Array<{ username: string, text: string }>> = {};
        commentsArray.forEach(c => {
            const pId = c.post_id;
            if (!commentsMap[pId]) commentsMap[pId] = [];
            const cUser = c.user_id ? userMap[c.user_id.toString()] : null;
            commentsMap[pId].push({
                username: cUser ? cUser.username : "Anonymous",
                text: c.comment
            });
        });

        return NextResponse.json({
            posts: formattedPosts,
            likesMap,
            commentsMap
        });

    } catch (error: any) {
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
