/**
 * Migration Script: Generate sellerCode for existing sellers
 * 
 * This script backfills sellerCode for all existing SellerSettings documents
 * that don't have a sellerCode yet. Run this once after deploying the sellerCode feature.
 * 
 * Usage:
 *   node backend/scripts/migrate-seller-codes.js
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { SellerSettings } from '../src/models/SellerSettings.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in environment variables');
  process.exit(1);
}

async function migrateSellerCodes() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find all SellerSettings without sellerCode
    const sellersWithoutCode = await SellerSettings.find({
      $or: [
        { sellerCode: { $exists: false } },
        { sellerCode: null },
        { sellerCode: '' },
      ],
    }).select('_id sellerId');

    console.log(`📊 Found ${sellersWithoutCode.length} sellers without sellerCode`);

    if (sellersWithoutCode.length === 0) {
      console.log('✅ All sellers already have sellerCode. Migration complete!');
      await mongoose.disconnect();
      return;
    }

    let updated = 0;
    let errors = 0;

    for (const seller of sellersWithoutCode) {
      try {
        // Generate unique sellerCode using the model's static method
        const code = await SellerSettings.generateSellerCode(seller._id);
        
        // Update the document
        await SellerSettings.findByIdAndUpdate(seller._id, {
          $set: { sellerCode: code },
        });

        updated++;
        if (updated % 10 === 0) {
          console.log(`⏳ Progress: ${updated}/${sellersWithoutCode.length} sellers updated...`);
        }
      } catch (error) {
        console.error(`❌ Error updating seller ${seller._id}:`, error.message);
        errors++;
      }
    }

    console.log('\n✅ Migration complete!');
    console.log(`   - Updated: ${updated} sellers`);
    console.log(`   - Errors: ${errors} sellers`);

    // Verify migration
    const remaining = await SellerSettings.countDocuments({
      $or: [
        { sellerCode: { $exists: false } },
        { sellerCode: null },
        { sellerCode: '' },
      ],
    });

    if (remaining > 0) {
      console.log(`⚠️  Warning: ${remaining} sellers still missing sellerCode`);
    } else {
      console.log('✅ All sellers now have sellerCode!');
    }

    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run migration
migrateSellerCodes();

