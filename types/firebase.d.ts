declare module 'firebase/auth' {
  export function createUserWithEmailAndPassword(auth: any, email: string, password: string): Promise<any>;
  export function updateProfile(user: any, { displayName, photoURL }: { displayName?: string, photoURL?: string }): Promise<void>;
}

declare module 'firebase/firestore' {
  export function doc(firestore: any, path: string, ...pathSegments: string[]): any;
  export function setDoc(reference: any, data: any): Promise<void>;
}

declare module 'firebase/storage' {
  export function ref(storage: any, path: string): any;
  export function uploadBytes(reference: any, data: any): Promise<any>;
  export function getDownloadURL(reference: any): Promise<string>;
}

declare module '../config/firebase' {
  export const auth: any;
  export const db: any;
  export const storage: any;
} 