import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!(session?.user as any)?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const db = await getDb();
        const user = await db.collection("users").findOne({ _id: new ObjectId((session!.user as any).id) });
        return NextResponse.json({ kolam_karma: user?.kolam_karma || 0 });
    } catch (error: any) {
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!(session?.user as any)?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { earnedKarma } = await req.json();
        if (typeof earnedKarma !== "number" || earnedKarma <= 0) {
            return NextResponse.json({ error: "Invalid karma value" }, { status: 400 });
        }

        const db = await getDb();
        await db.collection("users").updateOne(
            { _id: new ObjectId((session!.user as any).id) },
            { $inc: { kolam_karma: earnedKarma } }
        );

        const user = await db.collection("users").findOne({ _id: new ObjectId((session!.user as any).id) });
        return NextResponse.json({ kolam_karma: user?.kolam_karma || 0 });
    } catch (error: any) {
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
