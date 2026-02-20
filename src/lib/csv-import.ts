import { getDb } from './firebase-admin';

export const importProductsFromCsv = async (csvData: { name: string, price: number, sales: string, affiliate_link: string, category: string }[]) => {
  const db = getDb();
  const batch = db.batch();
  
  csvData.forEach((product) => {
    const docRef = db.collection('products').doc();
    batch.set(docRef, {
      ...product,
      created_at: new Date(),
    });
  });

  await batch.commit();
  console.log(`Successfully imported ${csvData.length} products to Firestore.`);
};
