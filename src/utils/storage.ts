import {
  Medication,
  FeedingSession,
  VitaminDRecord,
  BathRecord,
  BellyButtonRecord,
  DiaperChange,
  SleepRecord,
} from "../types";

type StorageCallback<T> = (data: T[]) => void;

const LOCAL_STORAGE_KEYS = {
  LAST_SYNC: "baby_tracker_last_sync",
  MEDICATIONS: "baby_tracker_medications",
  FEEDINGS: "baby_tracker_feedings",
};

// Make the helper available for other components
export const getApiUrl = (path: string) => {
  // Remove leading slash if present
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;

  if (process.env.NODE_ENV === "development") {
    // In development, use absolute path for proxy to work
    return `/api/${cleanPath}`;
  } else {
    // In production, use relative path
    return `api/${cleanPath}`;
  }
};

export const storage = {
  getStatus: async () => {
    const response = await fetch(getApiUrl("status"), {
      credentials: "include",
    });
    return response.json();
  },

  // Medications
  subscribeMedications: (callback: StorageCallback<Medication>) => {
    const fetchData = async () => {
      const response = await fetch(getApiUrl("medications"), {
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
    const response = await fetch(getApiUrl("medications"), {
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
    const response = await fetch(getApiUrl(`medications/${medication.id}`), {
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
    const response = await fetch(getApiUrl(`medications/${id}`), {
      method: "DELETE",
      credentials: "include",
    });

    if (!response.ok) throw new Error("Failed to delete medication");
    return response.json();
  },

  // Feedings
  subscribeFeedings: (callback: StorageCallback<FeedingSession>) => {
    const fetchData = async () => {
      const response = await fetch(getApiUrl("feedings"), {
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
    const response = await fetch(getApiUrl("feedings"), {
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
    const response = await fetch(getApiUrl(`feedings/${feeding.id}`), {
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
    const response = await fetch(getApiUrl(`feedings/${id}`), {
      method: "DELETE",
      credentials: "include",
    });

    if (!response.ok) throw new Error("Failed to delete feeding session");
    return response.json();
  },

  // Vitamin D
  subscribeVitaminD: (callback: StorageCallback<VitaminDRecord>) => {
    const fetchData = async () => {
      const response = await fetch(getApiUrl("vitamin-d"), {
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
    const response = await fetch(getApiUrl("vitamin-d"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(record),
      credentials: "include",
    });

    if (!response.ok) throw new Error("Failed to save vitamin D record");
    return response.json();
  },

  updateVitaminD: async (record: VitaminDRecord) => {
    const response = await fetch(getApiUrl(`vitamin-d/${record.date}`), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(record),
      credentials: "include",
    });

    if (!response.ok) throw new Error("Failed to update vitamin D record");
    return response.json();
  },

  deleteVitaminD: async (date: string) => {
    const response = await fetch(getApiUrl(`vitamin-d/${date}`), {
      method: "DELETE",
      credentials: "include",
    });

    if (!response.ok) throw new Error("Failed to delete vitamin D record");
    return response.json();
  },

  // Bath tracking
  subscribeBaths: (callback: StorageCallback<BathRecord>) => {
    const fetchData = async () => {
      const response = await fetch(getApiUrl("baths"), {
        credentials: "include",
      });
      const data = await response.json();
      callback(data);
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  },

  addBath: async (bath: BathRecord) => {
    const response = await fetch(getApiUrl("baths"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bath),
      credentials: "include",
    });

    if (!response.ok) throw new Error("Failed to save bath record");
    return response.json();
  },

  // Belly button tracking
  subscribeBellyButton: (callback: StorageCallback<BellyButtonRecord>) => {
    const fetchData = async () => {
      const response = await fetch(getApiUrl("belly-button"), {
        credentials: "include",
      });
      const data = await response.json();
      callback(data);
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  },

  addBellyButton: async (record: BellyButtonRecord) => {
    const response = await fetch(getApiUrl("belly-button"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(record),
      credentials: "include",
    });

    if (!response.ok) throw new Error("Failed to save belly button record");
    return response.json();
  },

  updateBellyButton: async (record: BellyButtonRecord) => {
    const response = await fetch(getApiUrl(`belly-button/${record.date}`), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(record),
      credentials: "include",
    });

    if (!response.ok) throw new Error("Failed to update belly button record");
    return response.json();
  },

  // Diapers
  subscribeDiapers: (callback: StorageCallback<DiaperChange>) => {
    const fetchData = async () => {
      const response = await fetch(getApiUrl("diapers"), {
        credentials: "include",
      });
      const data = await response.json();
      callback(
        data.map((diaper: any) => ({
          ...diaper,
          timestamp: new Date(diaper.timestamp),
        }))
      );
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  },

  addDiaper: async (diaper: DiaperChange) => {
    const response = await fetch(getApiUrl("diapers"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...diaper,
        timestamp: diaper.timestamp.toISOString(),
      }),
      credentials: "include",
    });

    if (!response.ok) throw new Error("Failed to save diaper change");
    return response.json();
  },

  deleteDiaper: async (id: string) => {
    const response = await fetch(getApiUrl(`diapers/${id}`), {
      method: "DELETE",
      credentials: "include",
    });

    if (!response.ok) throw new Error("Failed to delete diaper change");
    return response.json();
  },

  addOrUpdateSleep: async (sleep: SleepRecord) => {
    const response = await fetch(getApiUrl("sleep"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...sleep,
        bedTime: sleep.bedTime?.toISOString() || null,
        wakeTime: sleep.wakeTime?.toISOString() || null,
      }),
      credentials: "include",
    });

    if (!response.ok) throw new Error("Failed to save sleep record");
    return response.json();
  },

  deleteSleep: async (date: string) => {
    const response = await fetch(getApiUrl(`sleep/${date}`), {
      method: "DELETE",
      credentials: "include",
    });

    if (!response.ok) throw new Error("Failed to delete sleep record");
    return response.json();
  },
};
