const { MongoClient } = require('mongodb');

async function main() {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/kolam_ai';
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db('kolam_ai');

        const users = await db.collection('users').find({}).toArray();
        console.log("Users:", users.length, users.map(u => ({ id: u._id, name: u.name, karma: u.kolam_karma })));

        const posts = await db.collection('posts').find({}).toArray();
        console.log("Posts:", posts.length, posts.map(p => ({ id: p._id, user_id: p.user_id })));

    } finally {
        await client.close();
    }
}

main().catch(console.error);
