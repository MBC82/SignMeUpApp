import { Event } from '../types/Event';

// Mock data for development
const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Summer Music Festival',
    description: 'A day of amazing music and entertainment',
    date: '2024-07-15',
    time: '14:00',
    location: 'Central Park',
    maxParticipants: 1000,
    currentParticipants: 750,
    organizerId: 'org1',
    organizerName: 'Music Events Inc',
    category: 'Music',
    imageUrl: 'https://example.com/music-festival.jpg',
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: '2',
    title: 'Tech Conference 2024',
    description: 'Annual technology conference',
    date: '2024-08-20',
    time: '09:00',
    location: 'Convention Center',
    maxParticipants: 500,
    currentParticipants: 300,
    organizerId: 'org2',
    organizerName: 'Tech Events LLC',
    category: 'Technology',
    imageUrl: 'https://example.com/tech-conference.jpg',
    createdAt: '2024-03-19T15:30:00Z',
    updatedAt: '2024-03-19T15:30:00Z',
  },
];

export const getEvents = async (): Promise<Event[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  return mockEvents;
};

export const getEventById = async (id: string): Promise<Event | null> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockEvents.find(event => event.id === id) || null;
};

export const createEvent = async (event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Promise<Event> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  const newEvent: Event = {
    ...event,
    id: Math.random().toString(36).substr(2, 9),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  mockEvents.push(newEvent);
  return newEvent;
};

export const updateEvent = async (id: string, updates: Partial<Event>): Promise<Event | null> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  const index = mockEvents.findIndex(event => event.id === id);
  if (index === -1) return null;
  
  mockEvents[index] = {
    ...mockEvents[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  return mockEvents[index];
};

export const deleteEvent = async (id: string): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const index = mockEvents.findIndex(event => event.id === id);
  if (index === -1) return false;
  
  mockEvents.splice(index, 1);
  return true;
}; 