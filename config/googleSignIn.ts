import { GoogleSignin } from '@react-native-google-signin/google-signin';

// Web client ID from Firebase console > Authentication > Sign-in method > Google > Web SDK configuration.
export const GOOGLE_WEB_CLIENT_ID = 'REPLACE_WITH_WEB_CLIENT_ID.apps.googleusercontent.com';

export const configureGoogleSignIn = () => {
  GoogleSignin.configure({ webClientId: GOOGLE_WEB_CLIENT_ID });
};
