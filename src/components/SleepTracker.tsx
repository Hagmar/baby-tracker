import React, { useState } from "react";
import { SleepRecord } from "../types";
import { storage } from "../utils/storage";
import { useData } from "../contexts/DataContext";
import Modal from "./Modal";
import DateTimePicker from "./DateTimePicker";
import "./SleepTracker.css";

const SleepTracker: React.FC = () => {
  const { sleep, updateData } = useData();
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [showWeekView, setShowWeekView] = useState(false);

  const addOrUpdateSleep = async (
    date: string,
    update: Partial<SleepRecord>
  ) => {
    const existingRecord = sleep.find((s) => s.date === date);
    const newRecord: SleepRecord = {
      id: existingRecord?.id || Date.now().toString(),
      date,
      bedTime: existingRecord?.bedTime || null,
      wakeTime: existingRecord?.wakeTime || null,
      comment: existingRecord?.comment || undefined,
      ...update,
    };

    try {
      await storage.addOrUpdateSleep(newRecord);
      await updateData();
      setComment("");
      setEditingDate(null);
    } catch (error) {
      console.error("Failed to save sleep record:", error);
    }
  };

  const deleteSleep = async (date: string) => {
    try {
      await storage.deleteSleep(date);
      await updateData();
    } catch (error) {
      console.error("Failed to delete sleep record:", error);
    }
  };

  const formatTime = (date: Date | null): string => {
    if (!date) return "Not set";
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const calculateDuration = (
    bedTime: Date | null,
    wakeTime: Date | null
  ): string => {
    if (!bedTime || !wakeTime) return "Incomplete";
    const diff = wakeTime.getTime() - bedTime.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const getDisplayDates = (): string[] => {
    const dates: string[] = [];
    const today = new Date();
    const daysToShow = showWeekView ? 7 : 3;
    for (let i = 0; i < daysToShow; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split("T")[0]);
    }
    return dates;
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (dateStr === today.toISOString().split("T")[0]) {
      return "Tonight";
    } else if (dateStr === yesterday.toISOString().split("T")[0]) {
      return "Last Night";
    } else {
      return date.toLocaleDateString(undefined, {
        weekday: "long",
        month: "short",
        day: "numeric",
      });
    }
  };

  const startEditing = (date: string) => {
    const record = sleep.find((s) => s.date === date);
    setEditingDate(date);
    setComment(record?.comment || "");
  };

  const dates = getDisplayDates();

  return (
    <div className="sleep-tracker">
      <div className="sleep-section">
        <div className="sleep-header">
          <h3>{showWeekView ? "Past Week" : "Last 24 Hours"}</h3>
          <button
            className="button small"
            onClick={() => setShowWeekView(!showWeekView)}
          >
            Show {showWeekView ? "24 Hours" : "Week"}
          </button>
        </div>
        <div className="sleep-grid">
          {dates.map((date) => {
            const record = sleep.find((s) => s.date === date);
            return (
              <div key={date} className="sleep-card">
                <div className="sleep-header">
                  <h3>{formatDate(date)}</h3>
                  <div className="duration">
                    {calculateDuration(
                      record?.bedTime || null,
                      record?.wakeTime || null
                    )}
                  </div>
                </div>
                <div className="sleep-card-row">
                  <div className="bed-time">
                    <span>🌙</span>
                    <button
                      className="button small"
                      onClick={() => {
                        const now = new Date();
                        addOrUpdateSleep(date, { bedTime: now });
                      }}
                    >
                      {record?.bedTime
                        ? formatTime(record.bedTime)
                        : "Set Bed Time"}
                    </button>
                  </div>
                  <div className="wake-time">
                    <span>☀️</span>
                    <button
                      className="button small"
                      onClick={() => {
                        const now = new Date();
                        addOrUpdateSleep(date, { wakeTime: now });
                      }}
                    >
                      {record?.wakeTime
                        ? formatTime(record.wakeTime)
                        : "Set Wake Time"}
                    </button>
                  </div>
                  <div className="sleep-actions">
                    <button
                      className="button small"
                      onClick={() => startEditing(date)}
                    >
                      Edit
                    </button>
                    {record && (
                      <button
                        className="button small danger"
                        onClick={() => deleteSleep(date)}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
                {record?.comment && (
                  <div className="sleep-comment">{record.comment}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <Modal
        isOpen={!!editingDate}
        onClose={() => setEditingDate(null)}
        title={`Edit Sleep Record - ${
          editingDate ? formatDate(editingDate) : ""
        }`}
      >
        {editingDate && (
          <div className="sleep-edit-form">
            <div className="time-pickers">
              <div className="time-picker">
                <label>Bed Time:</label>
                <DateTimePicker
                  initialDate={
                    sleep.find((s) => s.date === editingDate)?.bedTime ||
                    new Date()
                  }
                  onSave={(date: Date) =>
                    addOrUpdateSleep(editingDate, { bedTime: date })
                  }
                  onCancel={() => setEditingDate(null)}
                />
              </div>
              <div className="time-picker">
                <label>Wake Time:</label>
                <DateTimePicker
                  initialDate={
                    sleep.find((s) => s.date === editingDate)?.wakeTime ||
                    new Date()
                  }
                  onSave={(date: Date) =>
                    addOrUpdateSleep(editingDate, { wakeTime: date })
                  }
                  onCancel={() => setEditingDate(null)}
                />
              </div>
            </div>
            <div className="comment-input">
              <label>Comment:</label>
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment (optional)"
              />
              <button
                className="button"
                onClick={() => addOrUpdateSleep(editingDate, { comment })}
              >
                Save Comment
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SleepTracker;
