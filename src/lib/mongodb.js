import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/vegas_one';
const options = {
  maxPoolSize: 20,
  minPoolSize: 5,
  serverSelectionTimeoutMS: 5000,
};

let client;
let clientPromise;

if (!global._mongoClientPromise) {
  client = new MongoClient(uri, options);
  global._mongoClientPromise = client.connect();
}
clientPromise = global._mongoClientPromise;

let cachedDb = null;

export async function getDb(dbName = 'vegas_one') {
  try {
    if (cachedDb && cachedDb.databaseName === dbName) {
      return cachedDb;
    }
    const connectedClient = await clientPromise;
    cachedDb = connectedClient.db(dbName);
    return cachedDb;
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    throw new Error('Database connection failed. Please ensure MongoDB is running or MONGODB_URI is configured.');
  }
}

export default clientPromise;
