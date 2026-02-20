import admin from 'firebase-admin';

const getFirebaseAdmin = () => {
  if (!admin.apps.length) {
    const config = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };

    if (config.projectId && config.clientEmail && config.privateKey) {
        try {
            admin.initializeApp({
                credential: admin.credential.cert(config as any),
                databaseURL: `https://${config.projectId}.firebaseio.com`,
            });
        } catch (error) {
            console.error('Firebase Admin init error:', error);
        }
    }
  }
  return admin;
};

export const getDb = () => getFirebaseAdmin().firestore();
export const db = admin.apps.length ? admin.firestore() : null; // Fallback for existing code but better use getDb()

export { admin };
