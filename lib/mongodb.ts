import { MongoClient } from 'mongodb';

if (!process.env.MONGODB_URI) {
    // Using localhost fallback if not explicitly defined in .env
    process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/kolam_ai';
}

const uri = process.env.MONGODB_URI;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
    // In development mode, use a global variable to preserve the value
    // across module reloads caused by HMR (Hot Module Replacement).
    let globalWithMongo = global as typeof globalThis & {
        _mongoClientPromise?: Promise<MongoClient>;
    };

    if (!globalWithMongo._mongoClientPromise) {
        client = new MongoClient(uri, options);
        globalWithMongo._mongoClientPromise = client.connect();
    }
    clientPromise = globalWithMongo._mongoClientPromise;
} else {
    // In production mode, it's best to not use a global variable.
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
}

/**
 * Helper to quickly get the default database instance
 */
export async function getDb(dbName = 'kolam_ai') {
    const connectedClient = await clientPromise;
    return connectedClient.db(dbName);
}

export default clientPromise;
