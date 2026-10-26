import React, { createContext, useContext, useState } from 'react';

export type AppEvent = {
  id: string;
  name: string;
  location: string;
  organizer: string;
  draft: boolean;
};

type Ctx = {
  events: AppEvent[];
  addEvent: (e: Omit<AppEvent, 'id'>) => void;
  removeEvent: (id: string) => void;
};

const EventsContext = createContext<Ctx>({ events: [], addEvent: () => {}, removeEvent: () => {} });

export const useEvents = () => useContext(EventsContext);

export const EventsProvider = ({ children }: { children: React.ReactNode }) => {
  const [events, setEvents] = useState<AppEvent[]>([]);
  const addEvent = (e: Omit<AppEvent, 'id'>) =>
    setEvents(prev => [{ ...e, id: String(Date.now()) }, ...prev]);
  const removeEvent = (id: string) => setEvents(prev => prev.filter(e => e.id !== id));
  return (
    <EventsContext.Provider value={{ events, addEvent, removeEvent }}>
      {children}
    </EventsContext.Provider>
  );
};
