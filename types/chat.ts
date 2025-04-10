import { Timestamp } from '@react-native-firebase/firestore';

export type ChatMessage = {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  userPhotoURL?: string;
  text: string;
  timestamp: Timestamp;
};

export type ChatParticipant = {
  userId: string;
  userName: string;
  userPhotoURL?: string;
  lastSeen: Timestamp;
};

export type ChatRoom = {
  id: string;
  eventId: string;
  participants: ChatParticipant[];
  lastMessage?: ChatMessage;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}; 