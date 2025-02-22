import React from "react";
import {
  FeedingSession,
  VitaminDRecord,
  BathRecord,
  BellyButtonRecord,
} from "../types";

interface StatusPanelProps {
  feedings: FeedingSession[];
  vitaminD: VitaminDRecord[];
  baths: BathRecord[];
  bellyButton: BellyButtonRecord[];
}

const StatusPanel: React.FC<StatusPanelProps> = ({
  feedings,
  vitaminD,
  baths,
  bellyButton,
}) => {
  // Breastfeeding status
  const getBreastfeedingStatus = (): "future" | "soon" | "past" => {
    if (feedings.length === 0) return "past";
    const latestFeeding = new Date(
      Math.max(...feedings.map((f) => f.timestamp.getTime()))
    );
    const nextFeeding = new Date(latestFeeding.getTime() + 3 * 60 * 60 * 1000);

    const now = new Date();
    const diffMs = nextFeeding.getTime() - now.getTime();
    const hourMs = 60 * 60 * 1000;

    if (diffMs < 0) return "past";
    if (diffMs < hourMs) return "soon";
    return "future";
  };

  // Vitamin D status
  const getVitaminDStatus = (): "success" | "danger" => {
    const today = new Date().toISOString().split("T")[0];
    const todayRecord = vitaminD.find((r) => r.date === today);
    return todayRecord?.taken ? "success" : "danger";
  };

  // Bath status
  const getBathStatus = (): "success" | "warning" | "danger" => {
    if (baths.length === 0) return "danger";
    const latestBath = new Date(
      Math.max(...baths.map((b) => new Date(b.timestamp).getTime()))
    );
    const now = new Date();
    const daysSinceLastBath =
      (now.getTime() - latestBath.getTime()) / (1000 * 60 * 60 * 24);

    if (daysSinceLastBath > 7) return "danger";
    if (daysSinceLastBath > 5) return "warning";
    return "success";
  };

  // Belly button status
  const getBellyButtonStatus = (): "success" | "danger" => {
    const today = new Date().toISOString().split("T")[0];
    const todayRecord = bellyButton.find((r) => r.date === today);
    const now = new Date();
    const isEvening = now.getHours() >= 17; // After 5 PM

    if (!todayRecord?.morning) return "danger";
    if (isEvening && !todayRecord?.evening) return "danger";
    return "success";
  };

  return (
    <div className="status-panel">
      <div className={`status-indicator ${getBreastfeedingStatus()}`}>
        <span className="status-label">Feeding</span>
      </div>
      <div className={`status-indicator ${getVitaminDStatus()}`}>
        <span className="status-label">Vitamin D</span>
      </div>
      <div className={`status-indicator ${getBathStatus()}`}>
        <span className="status-label">Bath</span>
      </div>
      <div className={`status-indicator ${getBellyButtonStatus()}`}>
        <span className="status-label">Belly Button</span>
      </div>
    </div>
  );
};

export default StatusPanel;
