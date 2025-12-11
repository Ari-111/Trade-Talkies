import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT 
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT) 
  : {};

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('Firebase Admin Initialized');
  } catch (error) {
    console.error('Firebase Admin Initialization Error:', error);
  }
}

export default admin;
