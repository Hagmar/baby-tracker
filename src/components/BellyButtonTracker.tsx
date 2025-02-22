import React, { useState, useEffect } from "react";
import { BellyButtonRecord } from "../types";
import { storage } from "../utils/storage";
import { useData } from "../contexts/DataContext";

const BellyButtonTracker: React.FC = () => {
  const { bellyButton, updateData } = useData();

  const toggleCleaning = async (
    date: string,
    period: "morning" | "evening"
  ) => {
    const existingRecord = bellyButton.find((r) => r.date === date);
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

    try {
      if (existingRecord) {
        await storage.updateBellyButton(newRecord);
      } else {
        await storage.addBellyButton(newRecord);
      }
      await updateData();
    } catch (error) {
      console.error("Failed to update belly button record:", error);
    }
  };

  const getLast3Days = () => {
    const result: BellyButtonRecord[] = [];
    for (let i = 0; i < 3; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const record = bellyButton.find((r) => r.date === dateStr);
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
                Morn.
              </button>
              <button
                className={`button ${record.evening ? "success" : "danger"}`}
                onClick={() => toggleCleaning(record.date, "evening")}
              >
                Eve.
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BellyButtonTracker;
