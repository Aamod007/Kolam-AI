/**
 * MongoDB collection initialization script.
 *
 * Run once (or on every cold-start) to ensure every collection and its
 * indexes exist.  MongoDB auto-creates collections on first insert, but
 * pre-creating them + indexes avoids race conditions and guarantees the
 * expected schema is discoverable in Compass / Atlas dashboard.
 *
 * Usage:
 *   npx tsx lib/init-db.ts          (standalone)
 *   import { ensureCollections } from '@/lib/init-db'   (programmatic)
 */

import { getDb } from './mongodb';

/** Collection → index definitions */
const COLLECTIONS: Record<string, Array<{ key: Record<string, 1 | -1>; unique?: boolean }>> = {
    /* ── Auth / Users ───────────────────────── */
    users: [
        { key: { email: 1 }, unique: true },
        { key: { kolam_karma: -1 } },
    ],

    /* ── Community ──────────────────────────── */
    posts: [
        { key: { user_id: 1 } },
        { key: { image_hash: 1 }, unique: true },
        { key: { created_at: -1 } },
    ],
    post_likes: [
        { key: { post_id: 1 } },
        { key: { user_id: 1, post_id: 1 }, unique: true },
    ],
    post_comments: [
        { key: { post_id: 1 } },
        { key: { created_at: 1 } },
    ],

    /* ── Annotations (recognition → dataset) ── */
    annotations: [
        { key: { hash: 1 }, unique: true },
        { key: { user_id: 1 } },
        { key: { created_at: -1 } },
    ],

    /* ── User analyses (recognition analytics) ─ */
    user_analyses: [
        { key: { user_id: 1 } },
        { key: { image_hash: 1 } },
        { key: { created_at: -1 } },
    ],

    /* ── User generations (creation page) ────── */
    user_generations: [
        { key: { user_id: 1 } },
        { key: { created_at: -1 } },
    ],

    /* ── Competitions ──────────────────────── */
    competitions: [
        { key: { status: 1 } },
        { key: { start_date: -1 } },
    ],
    competition_entries: [
        { key: { competition_id: 1 } },
        { key: { user_id: 1 } },
        { key: { created_at: -1 } },
    ],

    /* ── Games ─────────────────────────────── */
    game_scores: [
        { key: { user_id: 1 } },
        { key: { game_type: 1, score: -1 } },
        { key: { created_at: -1 } },
    ],

    /* ── Feedback ──────────────────────────── */
    feedback: [
        { key: { created_at: -1 } },
    ],

    /* ── Remove-BG API key rotation ────────── */
    removebg_keys: [
        { key: { usage_count: -1 } },
    ],
};

export async function ensureCollections() {
    const db = await getDb();
    const existing = new Set((await db.listCollections().toArray()).map(c => c.name));

    for (const [name, indexes] of Object.entries(COLLECTIONS)) {
        if (!existing.has(name)) {
            await db.createCollection(name);
            console.log(`✅ Created collection: ${name}`);
        } else {
            console.log(`   Collection exists : ${name}`);
        }

        for (const idx of indexes) {
            try {
                await db.collection(name).createIndex(idx.key, {
                    unique: idx.unique ?? false,
                    background: true,
                });
            } catch (e: any) {
                // Index may already exist with same spec – ignore
                if (!e.message?.includes('already exists')) {
                    console.warn(`⚠  Index error on ${name}:`, e.message);
                }
            }
        }
    }

    console.log('\n🎉 All collections & indexes are ready.\n');
}

// Allow running directly: npx tsx lib/init-db.ts
if (require.main === module) {
    ensureCollections()
        .then(() => process.exit(0))
        .catch(err => {
            console.error(err);
            process.exit(1);
        });
}
