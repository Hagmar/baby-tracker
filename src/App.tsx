import React from "react";
import MedicationTracker from "./components/MedicationTracker";
import VitaminDTracker from "./components/VitaminDTracker";
import BreastfeedingTracker from "./components/BreastfeedingTracker";
import BathTracker from "./components/BathTracker";
import BellyButtonTracker from "./components/BellyButtonTracker";
import DiaperTracker from "./components/DiaperTracker";
import SleepTracker from "./components/SleepTracker";
import LoginPage from "./components/LoginPage";
import { useAuth } from "./contexts/AuthContext";
import "./App.css";
import StatusPanel from "./components/StatusPanel";
import { DataProvider } from "./contexts/DataContext";

function App() {
  const { isAuthenticated, logout, baby, user } = useAuth();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <DataProvider>
      <div className="app">
        <header>
          <div className="header-content">
            <div className="header-info">
              <h1>Baby Tracker</h1>
              {baby && (
                <div className="baby-info">
                  <span className="baby-name">{baby.name}</span>
                </div>
              )}
            </div>
            <div className="header-actions">
              <button className="button secondary" onClick={logout}>
                Logout
              </button>
            </div>
          </div>
        </header>
        <main>
          <StatusPanel />
          <section id="feeding-section" className="tracker-section">
            <h2>Breastfeeding</h2>
            <BreastfeedingTracker />
          </section>

          <section id="vitamin-d-section" className="tracker-section">
            <h2>Vitamin D</h2>
            <VitaminDTracker />
          </section>

          <section id="bath-section" className="tracker-section">
            <h2>Bath</h2>
            <BathTracker />
          </section>

          <section id="sleep-section" className="tracker-section">
            <h2>Sleep</h2>
            <SleepTracker />
          </section>

          <section id="diaper-section" className="tracker-section">
            <h2>Diapers</h2>
            <DiaperTracker />
          </section>

          <section id="belly-button-section" className="tracker-section">
            <h2>Belly Button Cleaning</h2>
            <BellyButtonTracker />
          </section>

          <section className="tracker-section">
            <h2>Mom's Medication</h2>
            <MedicationTracker />
          </section>
        </main>
      </div>
    </DataProvider>
  );
}

export default App;
