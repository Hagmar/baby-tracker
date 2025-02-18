import React, { useState, useEffect } from "react";
import { VitaminDRecord } from "../types";
import { storage } from "../utils/storage";

const VitaminDTracker: React.FC = () => {
  const [records, setRecords] = useState<VitaminDRecord[]>([]);

  useEffect(() => {
    const unsubscribe = storage.subscribeVitaminD(setRecords);
    return () => unsubscribe();
  }, []);

  const getToday = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const markTaken = async () => {
    const today = getToday();
    const existingRecord = records.find((r) => r.date === today);

    const newRecord = {
      date: today,
      taken: true,
    };

    // Optimistic update
    setRecords((prev) => {
      if (existingRecord) {
        return prev.map((r) => (r.date === today ? newRecord : r));
      } else {
        return [...prev, newRecord];
      }
    });

    try {
      if (existingRecord) {
        await storage.updateVitaminD(newRecord);
      } else {
        await storage.addVitaminD(newRecord);
      }
    } catch (error) {
      // Revert on error
      setRecords((prev) => {
        if (existingRecord) {
          return prev.map((r) => (r.date === today ? existingRecord : r));
        } else {
          return prev.filter((r) => r.date !== today);
        }
      });
      console.error("Failed to update vitamin D record:", error);
    }
  };

  const getLast3Days = () => {
    const result: VitaminDRecord[] = [];
    for (let i = 0; i < 3; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const record = records.find((r) => r.date === dateStr);
      result.push(record || { date: dateStr, taken: false });
    }
    return result;
  };

  return (
    <div className="vitamin-d-tracker">
      <button className="button" onClick={markTaken}>
        Mark Today's Vitamin D as Taken
      </button>

      <div className="vitamin-history">
        {getLast3Days().map((record) => (
          <div
            key={record.date}
            className={`vitamin-day ${record.taken ? "taken" : "not-taken"}`}
          >
            <span className="date">
              {new Date(record.date).toLocaleDateString(undefined, {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </span>
            <span className="status">
              {record.taken ? "✓ Taken" : "✗ Not taken"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VitaminDTracker;
