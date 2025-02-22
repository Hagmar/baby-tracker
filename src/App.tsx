import React from "react";
import MedicationTracker from "./components/MedicationTracker";
import VitaminDTracker from "./components/VitaminDTracker";
import BreastfeedingTracker from "./components/BreastfeedingTracker";
import BathTracker from "./components/BathTracker";
import BellyButtonTracker from "./components/BellyButtonTracker";
import LoginPage from "./components/LoginPage";
import { useAuth } from "./contexts/AuthContext";
import "./App.css";
import StatusPanel from "./components/StatusPanel";
import { useState, useEffect } from "react";
import { storage } from "./utils/storage";
import {
  FeedingSession,
  VitaminDRecord,
  BathRecord,
  BellyButtonRecord,
} from "./types";

function App() {
  const { isAuthenticated, logout } = useAuth();
  const [feedings, setFeedings] = useState<FeedingSession[]>([]);
  const [vitaminD, setVitaminD] = useState<VitaminDRecord[]>([]);
  const [baths, setBaths] = useState<BathRecord[]>([]);
  const [bellyButton, setBellyButton] = useState<BellyButtonRecord[]>([]);

  useEffect(() => {
    const unsubscribeFeedings = storage.subscribeFeedings(setFeedings);
    const unsubscribeVitaminD = storage.subscribeVitaminD(setVitaminD);
    const unsubscribeBaths = storage.subscribeBaths(setBaths);
    const unsubscribeBellyButton = storage.subscribeBellyButton(setBellyButton);

    return () => {
      unsubscribeFeedings();
      unsubscribeVitaminD();
      unsubscribeBaths();
      unsubscribeBellyButton();
    };
  }, []);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="app">
      <header>
        <div className="header-content">
          <h1>Baby Tracker</h1>
          <button className="button secondary" onClick={logout}>
            Logout
          </button>
        </div>
      </header>
      <main>
        <StatusPanel
          feedings={feedings}
          vitaminD={vitaminD}
          baths={baths}
          bellyButton={bellyButton}
        />
        <section className="tracker-section">
          <h2>Breastfeeding</h2>
          <BreastfeedingTracker />
        </section>

        <section className="tracker-section">
          <h2>Vitamin D</h2>
          <VitaminDTracker />
        </section>

        <section className="tracker-section">
          <h2>Bath</h2>
          <BathTracker />
        </section>

        <section className="tracker-section">
          <h2>Belly Button Cleaning</h2>
          <BellyButtonTracker />
        </section>

        <section className="tracker-section">
          <h2>Mom's Medication</h2>
          <MedicationTracker />
        </section>
      </main>
    </div>
  );
}

export default App;
