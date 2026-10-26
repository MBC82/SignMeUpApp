import React, { createContext, useContext, useState, useEffect } from 'react';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { authService, createUser, signIn, signOut as firebaseSignOut } from '../config/firebase';
import { configureGoogleSignIn } from '../config/googleSignIn';

interface AuthContextType {
  isLoggedIn: boolean;
  user: any | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const notReady = async () => {
  throw new Error('AuthProvider is not mounted');
};

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  user: null,
  loading: true,
  signInWithEmail: notReady,
  signUpWithEmail: notReady,
  signInWithGoogle: notReady,
  signOut: notReady,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    configureGoogleSignIn();
    const unsubscribe = authService.onAuthStateChanged((u) => {
      setUser(u);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    await signIn(email, password);
  };

  const signUpWithEmail = async (email: string, password: string) => {
    await createUser(email, password);
  };

  const signInWithGoogle = async () => {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const result: any = await GoogleSignin.signIn();
    const idToken = result?.data?.idToken ?? result?.idToken;
    if (!idToken) {
      throw new Error('Google sign-in did not return an ID token');
    }
    await authService.signInWithCredential(auth.GoogleAuthProvider.credential(idToken));
  };

  const signOut = async () => {
    try {
      await GoogleSignin.signOut();
    } catch {
      // not signed in with Google
    }
    await firebaseSignOut();
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn: !!user,
        user,
        loading,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
