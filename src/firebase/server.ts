import { firebaseConfig } from "@/firebase/config";
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";

let firebaseApp: FirebaseApp | null = null;
let firestore: Firestore | null = null;

/**
 * Server-side Firebase initialization for API routes and server components.
 * Uses the config object directly instead of Firebase App Hosting auto-init.
 */
export function getServerFirebase() {
  if (!firebaseApp) {
    const apps = getApps();
    firebaseApp = apps.length ? getApp() : initializeApp(firebaseConfig);
    firestore = getFirestore(firebaseApp);
  }

  if (!firebaseApp || !firestore) {
    throw new Error("Failed to initialize Firebase on server.");
  }

  return { firebaseApp, firestore };
}
