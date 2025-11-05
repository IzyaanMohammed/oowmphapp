'use client';
import {
  Auth, // Import Auth type for type hinting
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  FirebaseError
} from 'firebase/auth';
import { doc } from 'firebase/firestore';
import { getSdks } from '.';
import { setDocumentNonBlocking } from './non-blocking-updates';


/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth): void {
  // CRITICAL: Call signInAnonymously directly. Do NOT use 'await signInAnonymously(...)'.
  signInAnonymously(authInstance).catch(error => {
    // Although we don't await, we can still catch initial client-side validation errors
    // or immediate network issues. The primary error handling for auth state is the listener.
    console.error("Anonymous sign-in initiation failed:", error);
    // Optionally, emit a global error for UI feedback if needed
  });
  // Code continues immediately. Auth state change is handled by onAuthStateChanged listener.
}

type ErrorCallback = (error: FirebaseError) => void;

/** Initiate email/password sign-up (non-blocking). */
export function initiateEmailSignUp(authInstance: Auth, email: string, password: string, onError?: ErrorCallback): void {
  // CRITICAL: Call createUserWithEmailAndPassword directly. Do NOT use 'await createUserWithEmailAndPassword(...)'.
  createUserWithEmailAndPassword(authInstance, email, password)
    .then(userCredential => {
      // After user is created in Auth, create user document in Firestore
      const user = userCredential.user;
      const { firestore } = getSdks(authInstance.app);
      const userRef = doc(firestore, 'users', user.uid);
      const displayName = user.email?.split('@')[0] || 'New User';
      setDocumentNonBlocking(userRef, {
        id: user.uid,
        email: user.email,
        displayName: displayName
      }, {});
    })
    .catch(error => {
      console.error("Email sign-up initiation failed:", error);
      if (onError) {
        onError(error);
      } else {
        // We will throw this as a generic error since it is not a permissions issue.
        throw error;
      }
    });
  // Code continues immediately. Auth state change is handled by onAuthStateChanged listener.
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string, onError?: ErrorCallback): void {
  // CRITICAL: Call signInWithEmailAndPassword directly. Do NOT use 'await signInWithEmailAndPassword(...)'.
  signInWithEmailAndPassword(authInstance, email, password).catch(error => {
    console.error("Email sign-in initiation failed:", error);
    if (onError) {
        onError(error);
    } else {
        // This is a good place to show a toast to the user.
        // We will throw this as a generic error since it is not a permissions issue.
        throw error;
    }
  });
  // Code continues immediately. Auth state change is handled by onAuthStateChanged listener.
}
