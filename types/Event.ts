export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  maxParticipants: number;
  currentParticipants: number;
  organizerId: string;
  organizerName: string;
  category: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
} 