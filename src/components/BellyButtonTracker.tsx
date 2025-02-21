import React, { useState, useEffect } from "react";
import { BellyButtonRecord } from "../types";
import { storage } from "../utils/storage";

const BellyButtonTracker: React.FC = () => {
  const [records, setRecords] = useState<BellyButtonRecord[]>([]);

  useEffect(() => {
    const unsubscribe = storage.subscribeBellyButton(setRecords);
    return () => unsubscribe();
  }, []);

  const toggleCleaning = async (
    date: string,
    period: "morning" | "evening"
  ) => {
    const existingRecord = records.find((r) => r.date === date);
    const newRecord: BellyButtonRecord = {
      date,
      morning:
        period === "morning"
          ? !(existingRecord?.morning ?? false)
          : existingRecord?.morning ?? false,
      evening:
        period === "evening"
          ? !(existingRecord?.evening ?? false)
          : existingRecord?.evening ?? false,
      updatedAt: new Date().toISOString(),
    };

    // Optimistic update
    setRecords((prev) => {
      if (existingRecord) {
        return prev.map((r) => (r.date === date ? newRecord : r));
      } else {
        return [...prev, newRecord];
      }
    });

    try {
      if (existingRecord) {
        await storage.updateBellyButton(newRecord);
      } else {
        await storage.addBellyButton(newRecord);
      }
    } catch (error) {
      // Revert on error
      setRecords((prev) => {
        if (existingRecord) {
          return prev.map((r) => (r.date === date ? existingRecord : r));
        } else {
          return prev.filter((r) => r.date !== date);
        }
      });
      console.error("Failed to update belly button record:", error);
    }
  };

  const getLast3Days = () => {
    const result: BellyButtonRecord[] = [];
    for (let i = 0; i < 3; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const record = records.find((r) => r.date === dateStr);
      result.push(
        record || {
          date: dateStr,
          morning: false,
          evening: false,
          updatedAt: "",
        }
      );
    }
    return result;
  };

  return (
    <div className="belly-button-tracker">
      <div className="cleaning-history">
        {getLast3Days().map((record) => (
          <div key={record.date} className="cleaning-day">
            <span className="date">
              {new Date(record.date).toLocaleDateString(undefined, {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </span>
            <div className="cleaning-buttons">
              <button
                className={`button ${record.morning ? "success" : "danger"}`}
                onClick={() => toggleCleaning(record.date, "morning")}
              >
                Morning
              </button>
              <button
                className={`button ${record.evening ? "success" : "danger"}`}
                onClick={() => toggleCleaning(record.date, "evening")}
              >
                Evening
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BellyButtonTracker;
