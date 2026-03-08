export type CharacterStatus = 'Alive' | 'Injured' | 'Missing' | 'Dead';

export type EventType = 'Safe' | 'Suspense' | 'Violence' | 'Setback' | 'Resolution';

export interface Character {
  id: string;
  name: string;
  avatarUrl?: string;
  color: string;
}

export interface CharacterInEvent {
  characterId: string;
  statusChange?: CharacterStatus; // If undefined, status doesn't change
  itemsFound?: string[];
}

export interface StoryEvent {
  id: string;
  title: string;
  summary: string;
  location: string;
  tension: number; // 1 to 10
  type: EventType;
  time?: string; // e.g., "9:00 PM"
  charactersPresent: CharacterInEvent[];
}

export interface StoryState {
  characters: Character[];
  events: StoryEvent[]; // Ordered array
}
