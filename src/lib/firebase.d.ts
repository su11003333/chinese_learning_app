import { Firestore } from 'firebase/firestore';
import { Auth } from 'firebase/auth';

declare module './firebase.js' {
  export const db: Firestore | undefined;
  export const auth: Auth | undefined;
  export const firebaseConfig: object;
  export const isFirebaseInitialized: () => boolean;
  export const handleFirebaseError: (error: any) => string;
}