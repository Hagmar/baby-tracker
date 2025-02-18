export interface Medication {
  id: string;
  name: string;
  timestamp: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface FeedingSession {
  id: string;
  timestamp: string; // ISO date string
  breast?: "left" | "right" | "both";
  note?: string;
  updatedAt: string; // ISO date string
}

export interface VitaminDRecord {
  date: string; // ISO date string YYYY-MM-DD
  taken: boolean;
  updatedAt: string; // ISO date string
}

export interface User {
  username: string;
  passwordHash: string;
}

export interface Database {
  medications: Medication[];
  feedings: FeedingSession[];
  vitaminD: VitaminDRecord[];
  users: User[];
}

declare module "express-session" {
  interface SessionData {
    authenticated: boolean;
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
