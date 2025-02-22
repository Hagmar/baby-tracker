import React, { useState, useEffect } from "react";
import { VitaminDRecord } from "../types";
import { storage } from "../utils/storage";
import { useData } from "../contexts/DataContext";

const VitaminDTracker: React.FC = () => {
  const { vitaminD, updateData } = useData();

  const getToday = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const toggleVitaminD = async (date: string) => {
    const existingRecord = vitaminD.find((r) => r.date === date);
    const newRecord = {
      date,
      taken: !(existingRecord?.taken ?? false),
      updatedAt: new Date().toISOString(),
    };

    try {
      if (existingRecord) {
        await storage.updateVitaminD(newRecord);
      } else {
        await storage.addVitaminD(newRecord);
      }
      await updateData();
    } catch (error) {
      console.error("Failed to update vitamin D record:", error);
    }
  };

  const getLast3Days = () => {
    const result: VitaminDRecord[] = [];
    for (let i = 0; i < 3; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const record = vitaminD.find((r) => r.date === dateStr);
      result.push(record || { date: dateStr, taken: false });
    }
    return result;
  };

  return (
    <div className="vitamin-d-tracker">
      <button className="button" onClick={() => toggleVitaminD(getToday())}>
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
