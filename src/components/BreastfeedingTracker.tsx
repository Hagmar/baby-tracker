import React, { useState, useEffect } from "react";
import { FeedingSession } from "../types";
import { storage } from "../utils/storage";
import Modal from "./Modal";
import DateTimePicker from "./DateTimePicker";
import ConfirmModal from "./ConfirmModal";
import FeedingSessionEditor from "./FeedingSessionEditor";

const BreastfeedingTracker: React.FC = () => {
  const [sessions, setSessions] = useState<FeedingSession[]>([]);
  const [note, setNote] = useState("");
  const [selectedBreast, setSelectedBreast] = useState<
    "left" | "right" | "both" | null
  >(null);
  const [editingSession, setEditingSession] = useState<FeedingSession | null>(
    null
  );
  const [deletingSession, setDeletingSession] = useState<FeedingSession | null>(
    null
  );

  useEffect(() => {
    const unsubscribe = storage.subscribeFeedings(setSessions);
    return () => unsubscribe();
  }, []);

  const addSession = async (timestamp: Date = new Date()) => {
    const newSession: FeedingSession = {
      id: Date.now().toString(),
      timestamp,
      breast: selectedBreast || undefined,
      note: note.trim() || undefined,
    };

    // Optimistic update
    setSessions((prev) => [...prev, newSession]);

    try {
      await storage.addFeeding(newSession);
    } catch (error) {
      // Revert on error
      setSessions((prev) => prev.filter((s) => s.id !== newSession.id));
      console.error("Failed to save feeding session:", error);
    }

    // Reset form
    setNote("");
    setSelectedBreast(null);
  };

  const updateSession = async (updatedSession: FeedingSession) => {
    // Optimistic update
    setSessions((prev) =>
      prev.map((session) =>
        session.id === updatedSession.id ? updatedSession : session
      )
    );

    try {
      await storage.updateFeeding(updatedSession);
    } catch (error) {
      // Revert on error
      setSessions((prev) =>
        prev.map((session) =>
          session.id === updatedSession.id ? editingSession! : session
        )
      );
      console.error("Failed to update feeding session:", error);
    }
    setEditingSession(null);
  };

  const getLast24Hours = () => {
    const now = new Date();
    const cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    return sessions
      .filter((s) => s.timestamp >= cutoff)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  };

  const deleteSession = async () => {
    if (!deletingSession) return;

    // Store for potential revert
    const sessionToDelete = deletingSession;

    // Optimistic update
    setSessions((prev) => prev.filter((s) => s.id !== sessionToDelete.id));

    try {
      await storage.deleteFeeding(sessionToDelete.id);
    } catch (error) {
      // Revert on error
      setSessions((prev) => [...prev, sessionToDelete]);
      console.error("Failed to delete feeding session:", error);
    }
    setDeletingSession(null);
  };

  const formatTimestamp = (timestamp: Date): string => {
    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    const feedingDate = new Date(timestamp);
    feedingDate.setHours(0, 0, 0, 0);

    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    };

    if (feedingDate.getTime() === today.getTime()) {
      return `Today ${timestamp.toLocaleTimeString([], timeOptions)}`;
    } else if (feedingDate.getTime() === today.getTime() - 86400000) {
      return `Yesterday ${timestamp.toLocaleTimeString([], timeOptions)}`;
    } else {
      return timestamp.toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    }
  };

  const getNextFeedingEstimate = (feedings: FeedingSession[]): Date | null => {
    if (feedings.length === 0) return null;

    const latestFeeding = new Date(
      Math.max(...feedings.map((f) => f.timestamp.getTime()))
    );
    return new Date(latestFeeding.getTime() + 3 * 60 * 60 * 1000); // Add 3 hours
  };

  const nextFeeding = getNextFeedingEstimate(sessions);

  const getEstimateStatus = (
    estimatedTime: Date
  ): "future" | "soon" | "past" => {
    const now = new Date();
    const diffMs = estimatedTime.getTime() - now.getTime();
    const hourMs = 60 * 60 * 1000;

    if (diffMs < 0) return "past";
    if (diffMs < hourMs) return "soon";
    return "future";
  };

  return (
    <div className="breastfeeding-tracker">
      {nextFeeding && (
        <div className="next-feeding-estimate">
          <span>Next feeding estimated: </span>
          <strong className={getEstimateStatus(nextFeeding)}>
            {formatTimestamp(nextFeeding)}
          </strong>
        </div>
      )}
      <div className="feeding-form">
        <div className="breast-selection">
          <button
            className={`button ${selectedBreast === "left" ? "selected" : ""}`}
            onClick={() => setSelectedBreast("left")}
          >
            Left Breast
          </button>
          <button
            className={`button ${selectedBreast === "right" ? "selected" : ""}`}
            onClick={() => setSelectedBreast("right")}
          >
            Right Breast
          </button>
          <button
            className={`button ${selectedBreast === "both" ? "selected" : ""}`}
            onClick={() => setSelectedBreast("both")}
          >
            Both
          </button>
        </div>

        <div className="note-input">
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note (optional)"
          />
        </div>

        <button className="button" onClick={() => addSession()}>
          Log Feeding Session
        </button>
      </div>

      <div className="feeding-history">
        <h3>Last 24 Hours</h3>
        {getLast24Hours().map((session) => (
          <div key={session.id} className="feeding-entry">
            <div className="feeding-info">
              <div className="feeding-time">
                {formatTimestamp(session.timestamp)}
              </div>
              {session.breast && (
                <div className="feeding-breast">Breast: {session.breast}</div>
              )}
              {session.note && (
                <div className="feeding-note">{session.note}</div>
              )}
            </div>
            <div className="entry-actions">
              <button
                className="button small"
                onClick={() => setEditingSession(session)}
              >
                Edit
              </button>
              <button
                className="button small danger"
                onClick={() => setDeletingSession(session)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={!!editingSession}
        onClose={() => setEditingSession(null)}
        title="Edit Feeding Session"
      >
        {editingSession && (
          <FeedingSessionEditor
            session={editingSession}
            onSave={updateSession}
            onCancel={() => setEditingSession(null)}
          />
        )}
      </Modal>

      <ConfirmModal
        isOpen={!!deletingSession}
        onClose={() => setDeletingSession(null)}
        onConfirm={deleteSession}
        title="Delete Feeding Entry"
        message="Are you sure you want to delete this feeding entry?"
      />
    </div>
  );
};

export default BreastfeedingTracker;
