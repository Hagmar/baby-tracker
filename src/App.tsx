import React from "react";
import MedicationTracker from "./components/MedicationTracker";
import VitaminDTracker from "./components/VitaminDTracker";
import BreastfeedingTracker from "./components/BreastfeedingTracker";
import LoginPage from "./components/LoginPage";
import { useAuth } from "./contexts/AuthContext";
import "./App.css";

function App() {
  const { isAuthenticated, logout } = useAuth();

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
        <section className="tracker-section">
          <h2>Mom's Medication</h2>
          <MedicationTracker />
        </section>

        <section className="tracker-section">
          <h2>Vitamin D</h2>
          <VitaminDTracker />
        </section>

        <section className="tracker-section">
          <h2>Breastfeeding</h2>
          <BreastfeedingTracker />
        </section>
      </main>
    </div>
  );
}

export default App;
