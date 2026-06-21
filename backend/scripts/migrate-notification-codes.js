import mongoose from 'mongoose';
import { SellerNotification } from '../src/models/SellerNotification.js'; // Adjust path as needed
import dotenv from 'dotenv';
dotenv.config();

async function generateNotificationCode(doc) {
  const timestamp = doc.createdAt 
    ? new Date(doc.createdAt).getTime().toString(36).toUpperCase() 
    : Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  let notificationCode = `NOTIF-${timestamp}-${random}`;
  let counter = 1;

  while (
    await mongoose.models.SellerNotification?.exists({
      notificationCode,
      _id: { $ne: doc._id },
    })
  ) {
    notificationCode = `NOTIF-${timestamp}-${random}-${counter}`;
    counter++;
  }
  return notificationCode;
}

async function migrateNotificationCodes() {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    console.error('MONGODB_URI not found in .env file.');
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB for notification code migration.');

    const notifications = await SellerNotification.find({ 
      notificationCode: { $exists: false } 
    });
    console.log(`Found ${notifications.length} notifications without notificationCode.`);

    for (const notification of notifications) {
      try {
        const newCode = await generateNotificationCode(notification);
        notification.notificationCode = newCode;
        await notification.save();
        console.log(`Generated notificationCode ${newCode} for notification ${notification._id}`);
      } catch (error) {
        console.error(`Failed to generate code for notification ${notification._id}:`, error.message);
      }
    }

    console.log('Notification code migration complete.');
  } catch (error) {
    console.error('MongoDB connection or migration error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

migrateNotificationCodes();

