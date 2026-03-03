import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!(session?.user as any)?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { postId, comment } = await req.json();
        if (!postId || !comment) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

        const db = await getDb();

        await db.collection("post_comments").insertOne({
            post_id: postId,
            user_id: new ObjectId((session!.user as any).id),
            comment: comment,
            created_at: new Date()
        });

        // Fetch updated comments
        const commentsCursor = db.collection("post_comments").find().sort({ created_at: 1 });
        const commentsArray = await commentsCursor.toArray();

        const commentUserIds = Array.from(new Set(commentsArray.map(c => c.user_id?.toString()).filter(Boolean)));
        const usersCursor = db.collection("users").find({ _id: { $in: commentUserIds.map((id: string) => new ObjectId(id)) } });
        const usersArray = await usersCursor.toArray();
        const userMap: Record<string, any> = {};
        usersArray.forEach(u => {
            userMap[u._id.toString()] = { username: u.name || "Anonymous" };
        });

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

        return NextResponse.json({ commentsMap });
    } catch (error: any) {
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
