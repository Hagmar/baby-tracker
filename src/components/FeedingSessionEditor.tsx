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
  const [timestamp, setTimestamp] = useState(new Date(session.timestamp));
  const [breast, setBreast] = useState<"left" | "right" | "both" | undefined>(
    session.breast
  );
  const [note, setNote] = useState(session.note || "");

  const handleSave = () => {
    onSave({
      ...session,
      timestamp,
      breast,
      note: note.trim() || undefined,
    });
  };

  return (
    <div className="feeding-session-editor">
      <div className="editor-section">
        <h4>Time</h4>
        <DateTimePicker
          initialDate={timestamp}
          onSave={setTimestamp}
          onCancel={() => {}}
          hideButtons
        />
      </div>

      <div className="editor-section">
        <h4>Breast</h4>
        <div className="breast-selection">
          <button
            className={`button ${breast === "left" ? "selected" : ""}`}
            onClick={() => setBreast("left")}
            type="button"
          >
            Left
          </button>
          <button
            className={`button ${breast === "right" ? "selected" : ""}`}
            onClick={() => setBreast("right")}
            type="button"
          >
            Right
          </button>
          <button
            className={`button ${breast === "both" ? "selected" : ""}`}
            onClick={() => setBreast("both")}
            type="button"
          >
            Both
          </button>
        </div>
      </div>

      <div className="editor-section">
        <h4>Note</h4>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
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
