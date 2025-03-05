import React, { useState } from "react";
import { DiaperChange } from "../types";
import { storage } from "../utils/storage";
import Modal from "./Modal";
import { useData } from "../contexts/DataContext";
import "./DiaperTracker.css";

interface DayStats {
  date: string;
  pee: number;
  poo: number;
  both: number;
  total: number;
  changes: DiaperChange[];
}

const DiaperTracker: React.FC = () => {
  const { diapers, updateData } = useData();
  const [editingDay, setEditingDay] = useState<string | null>(null);

  const addDiaper = async (type: "pee" | "poo" | "both") => {
    const newDiaper: DiaperChange = {
      id: Date.now().toString(),
      timestamp: new Date(),
      type,
    };

    try {
      await storage.addDiaper(newDiaper);
      await updateData();
    } catch (error) {
      console.error("Failed to save diaper change:", error);
    }
  };

  const deleteDiaper = async (id: string) => {
    try {
      await storage.deleteDiaper(id);
      await updateData();
    } catch (error) {
      console.error("Failed to delete diaper change:", error);
    }
  };

  const getDayStats = (): DayStats[] => {
    const days = new Map<string, DayStats>();
    const now = new Date();

    // Initialize the last 3 days
    for (let i = 0; i < 3; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      days.set(dateStr, {
        date: dateStr,
        pee: 0,
        poo: 0,
        both: 0,
        total: 0,
        changes: [],
      });
    }

    // Count diapers for each day
    diapers.forEach((diaper) => {
      const dateStr = new Date(diaper.timestamp).toISOString().split("T")[0];
      const stats = days.get(dateStr);
      if (stats) {
        stats[diaper.type]++;
        stats.total++;
        stats.changes.push(diaper);
      }
    });

    return Array.from(days.values()).sort((a, b) =>
      b.date.localeCompare(a.date)
    );
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (dateStr === today.toISOString().split("T")[0]) {
      return "Today";
    } else if (dateStr === yesterday.toISOString().split("T")[0]) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString(undefined, {
        weekday: "long",
        month: "short",
        day: "numeric",
      });
    }
  };

  const formatTime = (timestamp: Date): string => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const dayStats = getDayStats();

  return (
    <div className="diaper-tracker">
      <div className="diaper-form">
        <div className="button-group">
          <button className="button primary" onClick={() => addDiaper("pee")}>
            Pee
          </button>
          <button className="button primary" onClick={() => addDiaper("poo")}>
            Poo
          </button>
          <button className="button primary" onClick={() => addDiaper("both")}>
            Both
          </button>
        </div>
      </div>

      <div className="diaper-stats">
        <div className="stats-grid">
          {dayStats.map((day) => (
            <div key={day.date} className="day-stats-card">
              <div className="day-header">
                <h3>{formatDate(day.date)}</h3>
                <button
                  className="button small"
                  onClick={() => setEditingDay(day.date)}
                >
                  Edit
                </button>
              </div>
              <div className="stats-content">
                <div className="stat-item">
                  <span className="stat-label">Pee:</span>
                  <span className="stat-value">{day.pee}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Poo:</span>
                  <span className="stat-value">{day.poo}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Both:</span>
                  <span className="stat-value">{day.both}</span>
                </div>
                <div className="stat-item total">
                  <span className="stat-label">Total:</span>
                  <span className="stat-value">{day.total}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal
        isOpen={!!editingDay}
        onClose={() => setEditingDay(null)}
        title={`Edit Diaper Changes - ${
          editingDay ? formatDate(editingDay) : ""
        }`}
      >
        {editingDay && (
          <div className="diaper-edit-list">
            {dayStats
              .find((day) => day.date === editingDay)
              ?.changes.sort(
                (a, b) =>
                  new Date(b.timestamp).getTime() -
                  new Date(a.timestamp).getTime()
              )
              .map((change) => (
                <div key={change.id} className="diaper-edit-entry">
                  <div className="diaper-info">
                    <span className="time">{formatTime(change.timestamp)}</span>
                    <span className="type">{change.type}</span>
                  </div>
                  <button
                    className="button small danger"
                    onClick={() => deleteDiaper(change.id)}
                  >
                    Delete
                  </button>
                </div>
              ))}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DiaperTracker;
