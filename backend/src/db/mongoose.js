import mongoose from 'mongoose';

let isConnected = false;

export async function connectMongo(uri) {
  if (isConnected) return mongoose.connection;
  if (!uri) throw new Error('Missing MONGODB_URI');
  await mongoose.connect(uri, {
    dbName: process.env.MONGODB_DB || undefined,
  });
  const connection = mongoose.connection;
  try {
    const collection = connection.db.collection('selleronboardings');
    await collection.updateMany({ expiresAt: { $exists: true } }, { $unset: { expiresAt: '' } });
    await collection.dropIndex('expiresAt_1');
  } catch (err) {
    if (err?.codeName !== 'IndexNotFound' && err?.code !== 27) {
      console.warn('[mongoose] Failed to drop legacy expiresAt TTL index:', err.message || err);
    }
  }
  isConnected = true;
  return connection;
}


