export interface Venue {
  id: string;
  name: string;
  category: string;
  coordinates: readonly [number, number]; // [lng, lat]
  address: string;
  weight: number;
}

export type SessionStatus = 'DISCOVERY' | 'EN_ROUTE' | 'COMPLETED';

export interface JumpaSession {
  id: string;
  name: string;
  status: SessionStatus;
  destination: readonly [number, number] | null;
}

export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  time: string;
  isSystem: boolean;
}
