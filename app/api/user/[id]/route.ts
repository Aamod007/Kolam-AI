import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> | { id: string } }) {
    try {
        const resolvedParams = await params;
        const { id } = resolvedParams;
        if (!id || !ObjectId.isValid(id)) return NextResponse.json({ error: `Invalid ID: ${id}` }, { status: 400 });

        const db = await getDb();
        const user = await db.collection("users").findOne({ _id: new ObjectId(id) });

        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        return NextResponse.json({
            id: user._id.toString(),
            username: user.name || "Anonymous",
            profile_image_url: user.avatar_url || "",
            description: user.description || "",
            kolam_karma: user.kolam_karma || 0
        });
    } catch (error: any) {
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
