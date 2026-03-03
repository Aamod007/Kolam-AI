import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> | { id: string } }) {
    try {
        const resolvedParams = await params;
        const { id } = resolvedParams;
        if (!id || !ObjectId.isValid(id)) return NextResponse.json({ error: `Invalid ID: ${id}` }, { status: 400 });

        const db = await getDb();
        const cursor = db.collection("posts").find({ user_id: new ObjectId(id) }).sort({ created_at: -1 });
        const posts = await cursor.toArray();

        const formattedPosts = posts.map(p => ({
            id: p._id.toString(),
            image_url: p.image_data || p.image_url,
            description: p.description || "",
            created_at: p.created_at
        }));

        return NextResponse.json(formattedPosts);
    } catch (error: any) {
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
