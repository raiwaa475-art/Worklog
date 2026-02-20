import admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';
import * as dotenv from 'dotenv';

const serviceAccountPath = path.join(process.cwd(), 'test-5acf3-firebase-adminsdk-fbsvc-3ed8fa5fb6.json');
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

async function importCsv(filePath: string) {
  console.log(`Importing ${filePath}...`);
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const records = parse(fileContent, {
    columns: (header: string[]) => header.map(h => h.trim()),
    skip_empty_lines: true,
  });

  const batchSize = 400;
  let batch = db.batch();
  let count = 0;

  if (records.length > 0) {
    console.log('Record keys:', Object.keys(records[0] as any));
  }

  for (const recordRaw of records) {
    const record = recordRaw as any;
    // Mapping: รหัสสินค้า,ชื่อสินค้า,ราคา,ขาย,ชื่อร้านค้า,อัตราค่าคอมมิชชัน,คอมมิชชัน,ลิงก์สินค้า,ลิงก์ข้อเสนอ
    const productData = {
      productId: record['รหัสสินค้า'] || '',
      name: record['ชื่อสินค้า'] || '',
      price: parseFloat(record['ราคา'] || '0'),
      sales: record['ขาย'] || '',
      shopName: record['ชื่อร้านค้า'] || '',
      commissionRate: record['อัตราค่าคอมมิชชัน'] || '',
      commissionAmount: record['คอมมิชชัน'] || '',
      productLink: record['ลิงก์สินค้า'] || '',
      affiliateLink: record['ลิงก์ข้อเสนอ'] || '',
      category: 'General',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = db.collection('products').doc();
    batch.set(docRef, productData);
    count++;

    if (count % batchSize === 0) {
      await batch.commit();
      batch = db.batch();
      console.log(`Committed ${count} records...`);
    }
  }

  await batch.commit();
  console.log(`Finished importing ${count} records from ${filePath}`);
}

async function main() {
  const files = [
    'ลิงก์สินค้าหลายลิงก์20260220171348-a41ec748a0d34ad880962869863acae5.csv',
    'ลิงก์สินค้าหลายลิงก์20260220171325-f3bebe62d81348aabc5f7078236ddc0e.csv'
  ];

  for (const file of files) {
    const fullPath = path.join(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      await importCsv(fullPath);
    } else {
      console.error(`File not found: ${fullPath}`);
    }
  }
}

main().catch(console.error);
