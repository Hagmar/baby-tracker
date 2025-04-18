export interface Medication {
  id: string;
  name: string;
  timestamp: Date;
}

export interface MedicationRule {
  name: string;
  hoursBetweenDoses: number;
}

export interface FeedingSession {
  id: string;
  timestamp: Date;
  breast?: "left" | "right" | "both";
  note?: string;
}

export interface VitaminDRecord {
  date: string; // ISO date string YYYY-MM-DD
  taken: boolean;
}

export interface BathRecord {
  id: string;
  timestamp: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface BellyButtonRecord {
  date: string; // ISO date string YYYY-MM-DD
  morning: boolean;
  evening: boolean;
  updatedAt: string; // ISO date string
}

export interface DiaperChange {
  id: string;
  timestamp: Date;
  type: "pee" | "poo" | "both";
}
