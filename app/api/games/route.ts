import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

// GET - Fetch user's game scores and stats
export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    try {
        const db = await getDb();

        let userScores: any[] = [];
        if (userId) {
            userScores = await db.collection("game_scores")
                .find({ user_id: new ObjectId(userId) })
                .sort({ created_at: -1 })
                .limit(50)
                .toArray();
        }

        // Global top scores
        const topScores = await db.collection("game_scores")
            .find()
            .sort({ score: -1 })
            .limit(20)
            .toArray();

        // Fetch user info for top scores
        const userIds = Array.from(new Set(topScores.map((s: any) => s.user_id?.toString()).filter(Boolean)));
        let userMap: Record<string, any> = {};
        if (userIds.length > 0) {
            const users = await db.collection("users")
                .find({ _id: { $in: userIds.map((id: string) => new ObjectId(id)) } })
                .toArray();
            users.forEach((u: any) => {
                userMap[u._id.toString()] = {
                    username: u.name || "Anonymous",
                    avatar_url: u.avatar_url || "",
                };
            });
        }

        const formattedTopScores = topScores.map((s: any) => ({
            id: s._id.toString(),
            user: s.user_id ? userMap[s.user_id.toString()] : null,
            game_type: s.game_type,
            score: s.score,
            level: s.level,
            time_ms: s.time_ms,
            created_at: s.created_at,
        }));

        const formattedUserScores = userScores.map((s: any) => ({
            id: s._id.toString(),
            game_type: s.game_type,
            score: s.score,
            level: s.level,
            time_ms: s.time_ms,
            created_at: s.created_at,
        }));

        return NextResponse.json({
            userScores: formattedUserScores,
            topScores: formattedTopScores,
        });
    } catch (error: any) {
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}

// POST - Save a game result
export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!(session?.user as any)?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { game_type, score, level, time_ms } = await req.json();
        if (!game_type || score === undefined) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        const db = await getDb();
        const userId = (session!.user as any).id;

        await db.collection("game_scores").insertOne({
            user_id: new ObjectId(userId),
            game_type,
            score,
            level: level || 1,
            time_ms: time_ms || 0,
            created_at: new Date(),
        });

        // Award karma for playing
        const karmaReward = score >= 90 ? 10 : score >= 70 ? 5 : 2;
        await db.collection("users").updateOne(
            { _id: new ObjectId(userId) },
            { $inc: { kolam_karma: karmaReward } }
        );

        return NextResponse.json({
            success: true,
            karmaAwarded: karmaReward,
        });
    } catch (error: any) {
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
