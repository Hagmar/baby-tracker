export interface User {
  id: string;
  username: string;
  passwordHash: string;
  babyId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Baby {
  id: string;
  name: string;
  dateOfBirth: string; // ISO date string
  createdAt: string;
  updatedAt: string;
}

export interface Medication {
  id: string;
  babyId: string;
  name: string;
  timestamp: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface FeedingSession {
  id: string;
  babyId: string;
  timestamp: string; // ISO date string
  breast?: "left" | "right" | "both";
  note?: string;
  updatedAt: string; // ISO date string
}

export interface VitaminDRecord {
  id: string;
  babyId: string;
  date: string; // ISO date string YYYY-MM-DD
  taken: boolean;
  updatedAt: string; // ISO date string
}

export interface DiaperChange {
  id: string;
  babyId: string;
  timestamp: string;
  type: "pee" | "poo" | "both";
  updatedAt: string; // ISO date string
}

export interface SleepRecord {
  id: string;
  babyId: string;
  date: string; // YYYY-MM-DD for the night the sleep started
  bedTime: string | null; // When they went to bed (ISO string)
  wakeTime: string | null; // When they woke up (ISO string)
  comment?: string; // Optional comment about the night
  updatedAt: string; // ISO date string
}

export interface Database {
  users: User[];
  babies: Baby[];
  medications: Medication[];
  feedings: FeedingSession[];
  vitaminD: VitaminDRecord[];
  baths: BathRecord[];
  bellyButton: BellyButtonRecord[];
  diapers: DiaperChange[];
  sleep: SleepRecord[];
}

declare module "express-session" {
  interface SessionData {
    authenticated: boolean;
    userId?: string;
    babyId?: string;
  }
}

// Add a new type for tracking client sync state
export interface SyncRequest {
  lastSyncedAt: string; // ISO date string
}

export interface SyncResponse<T> {
  updates: T[];
  deletions: string[]; // Array of IDs that were deleted
  timestamp: string; // Current server timestamp
}

// Add these interfaces too
export interface BathRecord {
  id: string;
  babyId: string;
  timestamp: string;
  updatedAt: string;
}

export interface BellyButtonRecord {
  id: string;
  babyId: string;
  date: string;
  morning: boolean;
  evening: boolean;
  updatedAt: string;
}
