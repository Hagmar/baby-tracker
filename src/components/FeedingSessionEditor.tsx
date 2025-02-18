import React, { useState } from "react";
import { FeedingSession } from "../types";
import DateTimePicker from "./DateTimePicker";

interface FeedingSessionEditorProps {
  session: FeedingSession;
  onSave: (updatedSession: FeedingSession) => void;
  onCancel: () => void;
}

const FeedingSessionEditor: React.FC<FeedingSessionEditorProps> = ({
  session,
  onSave,
  onCancel,
}) => {
  const [editedSession, setEditedSession] = useState<FeedingSession>({
    ...session,
  });

  const handleTimeChange = (newTimestamp: Date) => {
    setEditedSession((prev) => ({
      ...prev,
      timestamp: newTimestamp,
    }));
  };

  const handleBreastChange = (
    newBreast: "left" | "right" | "both" | undefined
  ) => {
    setEditedSession((prev) => ({
      ...prev,
      breast: newBreast,
    }));
  };

  const handleNoteChange = (newNote: string) => {
    setEditedSession((prev) => ({
      ...prev,
      note: newNote.trim() || undefined,
    }));
  };

  const handleSave = () => {
    onSave(editedSession);
  };

  return (
    <div className="feeding-session-editor">
      <div className="editor-section">
        <h4>Time</h4>
        <DateTimePicker
          initialDate={editedSession.timestamp}
          onSave={handleTimeChange}
          onCancel={() => {}}
          hideButtons
        />
      </div>

      <div className="editor-section">
        <h4>Breast</h4>
        <div className="breast-selection">
          <button
            className={`button ${
              editedSession.breast === "left" ? "selected" : ""
            }`}
            onClick={() =>
              handleBreastChange(
                editedSession.breast === "left" ? undefined : "left"
              )
            }
          >
            Left
          </button>
          <button
            className={`button ${
              editedSession.breast === "right" ? "selected" : ""
            }`}
            onClick={() =>
              handleBreastChange(
                editedSession.breast === "right" ? undefined : "right"
              )
            }
          >
            Right
          </button>
          <button
            className={`button ${
              editedSession.breast === "both" ? "selected" : ""
            }`}
            onClick={() =>
              handleBreastChange(
                editedSession.breast === "both" ? undefined : "both"
              )
            }
          >
            Both
          </button>
        </div>
      </div>

      <div className="editor-section">
        <h4>Note</h4>
        <input
          type="text"
          value={editedSession.note || ""}
          onChange={(e) => handleNoteChange(e.target.value)}
          placeholder="Add a note (optional)"
          className="note-input"
        />
      </div>

      <div className="modal-actions">
        <button className="button secondary" onClick={onCancel}>
          Cancel
        </button>
        <button className="button" onClick={handleSave}>
          Save
        </button>
      </div>
    </div>
  );
};

export default FeedingSessionEditor;
