import React from "react";
import { useData } from "../contexts/DataContext";
import {
  FeedingSession,
  VitaminDRecord,
  BathRecord,
  BellyButtonRecord,
  DiaperChange,
} from "../types";

const StatusPanel: React.FC = () => {
  const { feedings, vitaminD, baths, bellyButton, diapers } = useData();

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

  // Diaper status
  const getDiaperStatus = (): "success" | "warning" => {
    if (diapers.length === 0) return "warning";
    const latestDiaper = new Date(
      Math.max(...diapers.map((d) => d.timestamp.getTime()))
    );
    const now = new Date();
    const hoursSinceLastDiaper =
      (now.getTime() - latestDiaper.getTime()) / (1000 * 60 * 60);

    return hoursSinceLastDiaper > 4 ? "warning" : "success";
  };

  // Add this helper function
  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="status-panel">
      <div
        className={`status-indicator ${getBreastfeedingStatus()}`}
        onClick={() => scrollToSection("feeding-section")}
        role="button"
        tabIndex={0}
      >
        <span className="status-label">Feeding</span>
      </div>
      <div
        className={`status-indicator ${getDiaperStatus()}`}
        onClick={() => scrollToSection("diaper-section")}
        role="button"
        tabIndex={0}
      >
        <span className="status-label">Diaper</span>
      </div>
      <div
        className={`status-indicator ${getVitaminDStatus()}`}
        onClick={() => scrollToSection("vitamin-d-section")}
        role="button"
        tabIndex={0}
      >
        <span className="status-label">Vitamin D</span>
      </div>
      <div
        className={`status-indicator ${getBathStatus()}`}
        onClick={() => scrollToSection("bath-section")}
        role="button"
        tabIndex={0}
      >
        <span className="status-label">Bath</span>
      </div>
      <div
        className={`status-indicator ${getBellyButtonStatus()}`}
        onClick={() => scrollToSection("belly-button-section")}
        role="button"
        tabIndex={0}
      >
        <span className="status-label">Belly Button</span>
      </div>
    </div>
  );
};

export default StatusPanel;
