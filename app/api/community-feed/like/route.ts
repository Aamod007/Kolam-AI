import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!(session?.user as any)?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { postId } = await req.json();
        if (!postId) return NextResponse.json({ error: "Missing postId" }, { status: 400 });

        const db = await getDb();

        // In a real app we might check if they already liked it using user_id, but imitating original logic
        await db.collection("post_likes").insertOne({
            post_id: postId,
            user_id: new ObjectId((session!.user as any).id),
            created_at: new Date()
        });

        // Return updated likesMap for convenience
        const likesCursor = db.collection("post_likes").find();
        const likesArray = await likesCursor.toArray();
        const likesMap: Record<string, number> = {};
        likesArray.forEach(l => {
            const pId = l.post_id;
            likesMap[pId] = (likesMap[pId] || 0) + 1;
        });

        return NextResponse.json({ likesMap });
    } catch (error: any) {
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
