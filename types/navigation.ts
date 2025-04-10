export type RootStackParamList = {
  Home: undefined;
  MyEvents: undefined;
  CreateEvent: undefined;
  UserProfile: undefined;
  ProfileSetup: { skipWelcome: boolean };
  EventDetails: { eventId: string };
  Chat: { eventId: string; eventName: string };
}; 