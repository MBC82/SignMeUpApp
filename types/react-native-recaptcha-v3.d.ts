declare module 'react-native-recaptcha-v3' {
  import { Component } from 'react';
  import { ViewStyle } from 'react-native';

  interface ReCAPTCHAProps {
    siteKey: string;
    baseUrl: string;
    onVerify: (token: string) => void;
    onError?: (error: any) => void;
    style?: ViewStyle;
  }

  export default class ReCAPTCHA extends Component<ReCAPTCHAProps> {}
} 