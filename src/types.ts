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
