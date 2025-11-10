import * as admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(), // Works on Cloud Run
  });
}

export const adminAuth = admin.auth();
