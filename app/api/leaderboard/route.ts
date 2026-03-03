import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const db = await getDb();
        const cursor = db.collection("users").find(
            { kolam_karma: { $exists: true, $ne: null } },
            { projection: { name: 1, avatar_url: 1, kolam_karma: 1 } }
        ).sort({ kolam_karma: -1 });

        const users = await cursor.toArray();

        const leaderboard = users.map(u => ({
            id: u._id.toString(),
            username: u.name || "Anonymous",
            profile_image_url: u.avatar_url || "",
            kolam_karma: u.kolam_karma || 0
        }));

        return NextResponse.json(leaderboard);
    } catch (error: any) {
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
