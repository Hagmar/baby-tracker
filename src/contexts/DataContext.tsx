import React, { createContext, useContext, useState, useEffect } from "react";
import { storage } from "../utils/storage";
import {
  Medication,
  FeedingSession,
  VitaminDRecord,
  BathRecord,
  BellyButtonRecord,
  DiaperChange,
  SleepRecord,
} from "../types";

interface DataContextType {
  medications: Medication[];
  feedings: FeedingSession[];
  vitaminD: VitaminDRecord[];
  baths: BathRecord[];
  bellyButton: BellyButtonRecord[];
  diapers: DiaperChange[];
  sleep: SleepRecord[];
  updateData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [data, setData] = useState<DataContextType>({
    medications: [],
    feedings: [],
    vitaminD: [],
    baths: [],
    bellyButton: [],
    diapers: [],
    sleep: [],
    updateData: async () => {},
  });

  const updateData = async () => {
    try {
      const newData = await storage.getStatus();

      // Convert dates for feedings, medications, diapers and sleep
      const processedData = {
        ...newData,
        feedings: newData.feedings.map((f: any) => ({
          ...f,
          timestamp: new Date(f.timestamp),
        })),
        medications: newData.medications.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp),
        })),
        diapers: newData.diapers.map((d: any) => ({
          ...d,
          timestamp: new Date(d.timestamp),
        })),
        sleep: newData.sleep.map((s: any) => ({
          ...s,
          bedTime: s.bedTime ? new Date(s.bedTime) : null,
          wakeTime: s.wakeTime ? new Date(s.wakeTime) : null,
        })),
      };

      setData((prev) => ({ ...prev, ...processedData }));
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  };

  useEffect(() => {
    updateData();
    const interval = setInterval(updateData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <DataContext.Provider value={{ ...data, updateData }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};
