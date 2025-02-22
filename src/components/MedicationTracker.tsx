import React, { useState, useEffect } from "react";
import { Medication, MedicationRule } from "../types";
import { storage } from "../utils/storage";
import Modal from "./Modal";
import DateTimePicker from "./DateTimePicker";
import ConfirmModal from "./ConfirmModal";
import { useData } from "../contexts/DataContext";

const MEDICATION_RULES: MedicationRule[] = [
  { name: "Alvedon", hoursBetweenDoses: 6 },
  { name: "Ipren", hoursBetweenDoses: 4 },
];

const MedicationTracker: React.FC = () => {
  const { medications, updateData } = useData();
  const [editingMedication, setEditingMedication] = useState<Medication | null>(
    null
  );
  const [deletingMedication, setDeletingMedication] =
    useState<Medication | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const addMedication = async (name: string, timestamp: Date = new Date()) => {
    const newMedication: Medication = {
      id: Date.now().toString(),
      name,
      timestamp,
    };

    try {
      await storage.addMedication(newMedication);
      await updateData();
    } catch (error) {
      console.error("Failed to save medication:", error);
    }
  };

  const getNextAllowedTime = (medicationName: string): Date | null => {
    const rule = MEDICATION_RULES.find((r) => r.name === medicationName);
    if (!rule) return null;

    const lastDose = medications
      .filter((m) => m.name === medicationName)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];

    if (!lastDose) return null;

    return new Date(
      lastDose.timestamp.getTime() + rule.hoursBetweenDoses * 60 * 60 * 1000
    );
  };

  const formatTimeRemaining = (nextAllowed: Date): string => {
    const diff = nextAllowed.getTime() - currentTime.getTime();
    if (diff <= 0) return "Now";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const getMedicationHistory = (medicationName: string): Medication[] => {
    const cutoff = new Date(currentTime.getTime() - 24 * 60 * 60 * 1000);
    return medications
      .filter((m) => m.name === medicationName && m.timestamp >= cutoff)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  };

  const updateMedicationTime = async (date: Date) => {
    if (!editingMedication) return;

    const updatedMedication: Medication = {
      ...editingMedication,
      timestamp: date,
    };

    try {
      await storage.updateMedication(updatedMedication);
      await updateData();
    } catch (error) {
      console.error("Failed to update medication:", error);
    }
    setEditingMedication(null);
  };

  const deleteMedication = async (id: string) => {
    try {
      await storage.deleteMedication(id);
      await updateData();
    } catch (error) {
      console.error("Failed to delete medication:", error);
    }
    setDeletingMedication(null);
  };

  const formatTimestamp = (timestamp: Date): string => {
    const today = new Date(currentTime);
    today.setHours(0, 0, 0, 0);

    const doseDate = new Date(timestamp);
    doseDate.setHours(0, 0, 0, 0);

    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    };

    if (doseDate.getTime() === today.getTime()) {
      return `Today ${timestamp.toLocaleTimeString([], timeOptions)}`;
    } else if (doseDate.getTime() === today.getTime() - 86400000) {
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

  return (
    <div className="medication-tracker">
      <table className="medication-table">
        <thead>
          <tr>
            <th>Medication</th>
            <th>Take Now</th>
            <th>Next Dose At</th>
            <th>Time Remaining</th>
            <th>Last 24 Hours</th>
          </tr>
        </thead>
        <tbody>
          {MEDICATION_RULES.map((rule) => {
            const nextAllowed = getNextAllowedTime(rule.name);
            const canTake = !nextAllowed || nextAllowed <= currentTime;
            const history = getMedicationHistory(rule.name);

            return (
              <tr key={rule.name}>
                <td>{rule.name}</td>
                <td>
                  <button
                    className="button"
                    onClick={() => addMedication(rule.name)}
                    disabled={!canTake}
                  >
                    Take {rule.name}
                  </button>
                </td>
                <td>
                  {nextAllowed
                    ? nextAllowed.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })
                    : "Now"}
                </td>
                <td>{nextAllowed ? formatTimeRemaining(nextAllowed) : "-"}</td>
                <td className="history-cell">
                  {history.map((med) => (
                    <div key={med.id} className="history-entry">
                      <span className="history-time">
                        {formatTimestamp(med.timestamp)}
                      </span>
                      <div className="history-actions">
                        <button
                          className="button small"
                          onClick={() => setEditingMedication(med)}
                        >
                          Edit
                        </button>
                        <button
                          className="button small danger"
                          onClick={() => setDeletingMedication(med)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <Modal
        isOpen={!!editingMedication}
        onClose={() => setEditingMedication(null)}
        title="Edit Medication Time"
      >
        {editingMedication && (
          <DateTimePicker
            initialDate={editingMedication.timestamp}
            onSave={updateMedicationTime}
            onCancel={() => setEditingMedication(null)}
          />
        )}
      </Modal>

      <ConfirmModal
        isOpen={!!deletingMedication}
        onClose={() => setDeletingMedication(null)}
        onConfirm={() =>
          deletingMedication && deleteMedication(deletingMedication.id)
        }
        title="Delete Medication Entry"
        message={`Are you sure you want to delete this ${deletingMedication?.name} entry?`}
      />
    </div>
  );
};

export default MedicationTracker;
