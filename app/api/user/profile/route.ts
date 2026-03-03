import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!(session?.user as any)?.id) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const db = await getDb();
        const user = await db.collection("users").findOne({ _id: new ObjectId((session!.user as any).id) });
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        return NextResponse.json({
            username: user.name || "",
            description: user.description || "",
            profile_image_url: user.avatar_url || "",
            prefer_gemini: user.prefer_gemini ?? false,
        });
    } catch (error: any) {
        return NextResponse.json({ message: "Database Error" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    const session = await getServerSession(authOptions);
    if (!(session?.user as any)?.id) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const data = await req.json();
        const db = await getDb();

        const updateData: any = {};
        if (data.username !== undefined) updateData.name = data.username;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.prefer_gemini !== undefined) updateData.prefer_gemini = data.prefer_gemini;
        if (data.profile_image_url !== undefined) updateData.avatar_url = data.profile_image_url;

        await db.collection("users").updateOne(
            { _id: new ObjectId((session!.user as any).id) },
            { $set: updateData }
        );

        return NextResponse.json({ message: "Success" });
    } catch (error: any) {
        return NextResponse.json({ message: "Database Error" }, { status: 500 });
    }
}
