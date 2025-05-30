import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// IMPORTANT: Replace these with your actual Firebase project's configuration values!
// In a production app, you would typically use environment variables for these
// (e.g., process.env.REACT_APP_API_KEY or import.meta.env.VITE_API_KEY)
// instead of hardcoding them directly.
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID_FROM_FIREBASE" // This is the Firebase App ID
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

// This 'appId' was used in your Firestore collection paths.
// It could be your Firebase project ID or a custom identifier for this specific instance of your app.
// If it's different from the Firebase App ID, define it here.
// If it's the same as your Firebase project ID, you could use firebaseConfig.projectId.
// For consistency with previous code, we'll define it separately.
// In a real app, this might also come from an environment variable if it changes per deployment.
const appId = 'default-plant-store'; // Or process.env.REACT_APP_INTERNAL_APP_ID, etc.

export { firebaseApp, auth, db, appId };