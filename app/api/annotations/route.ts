import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getDb } from "@/lib/mongodb";

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get("image") as File;
        const geminiStr = formData.get("gemini") as string;
        const hash = formData.get("hash") as string;

        if (!file || !hash) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        const db = await getDb();

        // Check if annotation already exists
        const existing = await db.collection("annotations").findOne({ hash });
        if (existing) {
            return NextResponse.json({ message: "Already exists" }, { status: 200 });
        }

        // Convert file to Base64 to store directly in MongoDB
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Image = `data:${file.type || 'image/jpeg'};base64,${buffer.toString("base64")}`;

        // Get Auth user if logged in
        const session = await getServerSession(authOptions);
        const userId = (session?.user as any)?.id ? (session?.user as any).id : null;

        let geminiObj = {};
        if (geminiStr) {
            try { geminiObj = JSON.parse(geminiStr); } catch (e) { }
        }

        const payload = {
            user_id: userId,
            image_data: base64Image,
            hash,
            gemini_result: geminiObj,
            created_at: new Date()
        };

        const result = await db.collection("annotations").insertOne(payload);

        return NextResponse.json({ message: "Stored successfully", id: result.insertedId }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
    }
}
