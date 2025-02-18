import React from "react";
import MedicationTracker from "./components/MedicationTracker";
import VitaminDTracker from "./components/VitaminDTracker";
import BreastfeedingTracker from "./components/BreastfeedingTracker";
import "./App.css";

function App() {
  return (
    <div className="app">
      <header>
        <h1>Baby Tracker</h1>
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
