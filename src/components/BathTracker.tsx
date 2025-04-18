import React, { useState, useEffect } from "react";
import { BathRecord } from "../types";
import { storage } from "../utils/storage";
import { useData } from "../contexts/DataContext";

const BathTracker: React.FC = () => {
  const { baths, updateData } = useData();

  const addBath = async () => {
    const newBath: BathRecord = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await storage.addBath(newBath);
      await updateData();
    } catch (error) {
      console.error("Failed to save bath record:", error);
    }
  };

  const latestBath =
    baths.length > 0
      ? new Date(Math.max(...baths.map((b) => new Date(b.timestamp).getTime())))
      : null;

  return (
    <div className="bath-tracker">
      <div className="latest-bath">
        <span>
          Latest bath:{" "}
          {latestBath
            ? latestBath.toLocaleDateString(undefined, {
                weekday: "short",
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
              })
            : "No baths recorded"}
        </span>
      </div>
      <button className="button" onClick={addBath}>
        Record Bath
      </button>
    </div>
  );
};

export default BathTracker;
