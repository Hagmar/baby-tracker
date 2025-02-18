import { Medication, FeedingSession, VitaminDRecord } from "../types";

type StorageCallback<T> = (data: T[]) => void;

const LOCAL_STORAGE_KEYS = {
  LAST_SYNC: "baby_tracker_last_sync",
  MEDICATIONS: "baby_tracker_medications",
  FEEDINGS: "baby_tracker_feedings",
};

export const storage = {
  // Medications
  subscribeMedications: (callback: StorageCallback<Medication>) => {
    const fetchData = async () => {
      const response = await fetch("/api/medications", {
        credentials: "include",
      });
      const data = await response.json();
      callback(
        data.map((med: any) => ({
          ...med,
          timestamp: new Date(med.timestamp),
        }))
      );
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  },

  addMedication: async (medication: Medication) => {
    const response = await fetch("/api/medications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...medication,
        timestamp: medication.timestamp.toISOString(),
      }),
      credentials: "include",
    });

    if (!response.ok) throw new Error("Failed to save medication");
    return response.json();
  },

  updateMedication: async (medication: Medication) => {
    const response = await fetch(`/api/medications/${medication.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...medication,
        timestamp: medication.timestamp.toISOString(),
      }),
      credentials: "include",
    });

    if (!response.ok) throw new Error("Failed to update medication");
    return response.json();
  },

  deleteMedication: async (id: string) => {
    const response = await fetch(`/api/medications/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!response.ok) throw new Error("Failed to delete medication");
    return response.json();
  },

  // Feedings
  subscribeFeedings: (callback: StorageCallback<FeedingSession>) => {
    const fetchData = async () => {
      const response = await fetch("/api/feedings", {
        credentials: "include",
      });
      const data = await response.json();
      callback(
        data.map((feeding: any) => ({
          ...feeding,
          timestamp: new Date(feeding.timestamp),
        }))
      );
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  },

  addFeeding: async (feeding: FeedingSession) => {
    const response = await fetch("/api/feedings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...feeding,
        timestamp: feeding.timestamp.toISOString(),
      }),
      credentials: "include",
    });

    if (!response.ok) throw new Error("Failed to save feeding session");
    return response.json();
  },

  updateFeeding: async (feeding: FeedingSession) => {
    const response = await fetch(`/api/feedings/${feeding.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...feeding,
        timestamp: feeding.timestamp.toISOString(),
      }),
      credentials: "include",
    });

    if (!response.ok) throw new Error("Failed to update feeding session");
    return response.json();
  },

  deleteFeeding: async (id: string) => {
    const response = await fetch(`/api/feedings/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!response.ok) throw new Error("Failed to delete feeding session");
    return response.json();
  },

  // Vitamin D
  subscribeVitaminD: (callback: StorageCallback<VitaminDRecord>) => {
    const fetchData = async () => {
      const response = await fetch("/api/vitamin-d", {
        credentials: "include",
      });
      const data = await response.json();
      callback(data);
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  },

  addVitaminD: async (record: VitaminDRecord) => {
    const response = await fetch("/api/vitamin-d", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(record),
      credentials: "include",
    });

    if (!response.ok) throw new Error("Failed to save vitamin D record");
    return response.json();
  },

  updateVitaminD: async (record: VitaminDRecord) => {
    const response = await fetch(`/api/vitamin-d/${record.date}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(record),
      credentials: "include",
    });

    if (!response.ok) throw new Error("Failed to update vitamin D record");
    return response.json();
  },

  deleteVitaminD: async (date: string) => {
    const response = await fetch(`/api/vitamin-d/${date}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!response.ok) throw new Error("Failed to delete vitamin D record");
    return response.json();
  },
};
