import { Medication, FeedingSession, VitaminDRecord } from "../types";

const STORAGE_KEYS = {
  MEDICATIONS: "baby_tracker_medications",
  FEEDINGS: "baby_tracker_feedings",
  VITAMIN_D: "baby_tracker_vitamin_d",
};

export const storage = {
  getMedications: (): Medication[] => {
    const data = localStorage.getItem(STORAGE_KEYS.MEDICATIONS);
    if (!data) return [];
    return JSON.parse(data).map((med: any) => ({
      ...med,
      timestamp: new Date(med.timestamp),
    }));
  },

  setMedications: (medications: Medication[]) => {
    localStorage.setItem(STORAGE_KEYS.MEDICATIONS, JSON.stringify(medications));
  },

  getFeedings: (): FeedingSession[] => {
    const data = localStorage.getItem(STORAGE_KEYS.FEEDINGS);
    if (!data) return [];
    return JSON.parse(data).map((feeding: any) => ({
      ...feeding,
      timestamp: new Date(feeding.timestamp),
    }));
  },

  setFeedings: (feedings: FeedingSession[]) => {
    localStorage.setItem(STORAGE_KEYS.FEEDINGS, JSON.stringify(feedings));
  },

  getVitaminD: (): VitaminDRecord[] => {
    const data = localStorage.getItem(STORAGE_KEYS.VITAMIN_D);
    return data ? JSON.parse(data) : [];
  },

  setVitaminD: (records: VitaminDRecord[]) => {
    localStorage.setItem(STORAGE_KEYS.VITAMIN_D, JSON.stringify(records));
  },
};
