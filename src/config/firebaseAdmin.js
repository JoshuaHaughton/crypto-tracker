import * as admin from "firebase-admin";

// Environment variable that holds a base64 encoded JSON string of the Firebase service account
const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;

// Check if any Firebase apps have been initialized already, to prevent re-initialization
if (!admin.apps.length) {
  // Decode the service account JSON string from base64 to ascii
  const serviceAccount = JSON.parse(
    Buffer.from(serviceAccountBase64, "base64").toString("ascii"),
  );

  // Initialize the Firebase admin SDK with the service account credentials
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// Get a reference to the Firestore database service
const adminFirestore = admin.firestore();
// Get a reference to the Firebase Auth service
const adminAuth = admin.auth();

// Export the Firestore and Auth services for use elsewhere in the server-side code
export { adminFirestore, adminAuth };
