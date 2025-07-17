import express from "express";
import cors from "cors";
import { Database } from "./types";
import fs from "fs/promises";
import path from "path";
import session from "express-session";
import { fileURLToPath } from "url";
import { dirname } from "path";
import crypto from "crypto";
import dotenv from "dotenv";

// Initialize __dirname (must come before dotenv.config)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, "../.env") });

// Validate environment variables
function validateEnv() {
  const required = ["ADMIN_USERNAME", "ADMIN_PASSWORD", "SESSION_SECRET"];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error("Error: Missing required environment variables:");
    missing.forEach((key) => console.error(`- ${key}`));
    console.error("\nPlease check your .env file and try again.");
    process.exit(1);
  }
}

validateEnv();

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_FILE = path.join(__dirname, "../data/db.json");
const FRONTEND_DIR = path.join(__dirname, "../../build");

// Move static file serving before other middleware
app.use(express.static(FRONTEND_DIR));

// Middleware
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "fallback_secret_key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      httpOnly: true,
    },
    name: "baby-tracker-session",
  })
);

// Initialize database
let db: Database = {
  medications: [],
  feedings: [],
  vitaminD: [],
  baths: [],
  bellyButton: [],
  diapers: [],
  sleep: [],
};

// Add these to track deletions
let deletedFeedings: { id: string; deletedAt: string }[] = [];

// Authentication middleware
const requireAuth = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  if (!req.session.authenticated) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
};

// Add this function before loadData()
function migrateDatabase(data: Partial<Database>): Database {
  // Ensure all collections exist with defaults
  return {
    medications: data.medications ?? [],
    feedings: data.feedings ?? [],
    vitaminD: data.vitaminD ?? [],
    baths: data.baths ?? [],
    bellyButton: data.bellyButton ?? [],
    diapers: data.diapers ?? [],
    sleep: data.sleep ?? [],
  };
}

// Update loadData() to use migration
async function loadData() {
  try {
    const data = await fs.readFile(DATA_FILE, "utf-8");
    db = migrateDatabase(JSON.parse(data));
  } catch (error) {
    console.log("No existing database found, starting fresh");
    db = migrateDatabase({});
  }
}

// Save data to file
async function saveData() {
  try {
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(db, null, 2));
  } catch (error) {
    console.error("Error saving data:", error);
  }
}

// Auth Routes
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  if (
    username === process.env.ADMIN_USERNAME &&
    hashPassword(password) === hashPassword(process.env.ADMIN_PASSWORD!)
  ) {
    req.session.authenticated = true;
    res.json({ success: true });
  } else {
    res.status(401).json({ error: "Invalid credentials" });
  }
});

app.post("/api/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).json({ error: "Logout failed" });
    } else {
      res.json({ success: true });
    }
  });
});

app.get("/api/check-session", (req, res) => {
  if (req.session.authenticated) {
    res.json({ authenticated: true });
  } else {
    res.status(401).json({ authenticated: false });
  }
});

// API Routes - now with authentication
app.get("/api/medications", requireAuth, (req, res) => {
  res.json(db.medications);
});

app.post("/api/medications", requireAuth, (req, res) => {
  const medication = req.body;
  db.medications.push(medication);
  saveData();
  res.json(medication);
});

app.put("/api/medications/:id", requireAuth, (req, res) => {
  const { id } = req.params;
  const medication = req.body;

  const index = db.medications.findIndex((m) => m.id === id);
  if (index === -1) {
    res.status(404).json({ error: "Medication not found" });
    return;
  }

  db.medications[index] = medication;
  saveData();
  res.json(medication);
});

app.delete("/api/medications/:id", requireAuth, (req, res) => {
  const { id } = req.params;
  db.medications = db.medications.filter((m) => m.id !== id);
  saveData();
  res.json({ success: true });
});

app.get("/api/feedings", requireAuth, (req, res) => {
  res.json(db.feedings);
});

app.post("/api/feedings", requireAuth, (req, res) => {
  const feeding = req.body;
  db.feedings.push(feeding);
  saveData();
  res.json(feeding);
});

app.put("/api/feedings/:id", requireAuth, (req, res) => {
  const { id } = req.params;
  const feeding = req.body;

  const index = db.feedings.findIndex((f) => f.id === id);
  if (index === -1) {
    res.status(404).json({ error: "Feeding session not found" });
    return;
  }

  db.feedings[index] = feeding;
  saveData();
  res.json(feeding);
});

app.delete("/api/feedings/:id", requireAuth, (req, res) => {
  const { id } = req.params;
  db.feedings = db.feedings.filter((f) => f.id !== id);
  saveData();
  res.json({ success: true });
});

app.get("/api/vitamin-d", requireAuth, (req, res) => {
  res.json(db.vitaminD);
});

app.post("/api/vitamin-d", requireAuth, (req, res) => {
  const record = req.body;
  const index = db.vitaminD.findIndex((r) => r.date === record.date);
  if (index >= 0) {
    db.vitaminD[index] = record;
  } else {
    db.vitaminD.push(record);
  }
  saveData();
  res.json(record);
});

app.put("/api/vitamin-d/:date", requireAuth, (req, res) => {
  const { date } = req.params;
  const record = req.body;

  const index = db.vitaminD.findIndex((r) => r.date === date);
  if (index === -1) {
    res.status(404).json({ error: "Vitamin D record not found" });
    return;
  }

  db.vitaminD[index] = record;
  saveData();
  res.json(record);
});

app.delete("/api/vitamin-d/:date", requireAuth, (req, res) => {
  const { date } = req.params;
  db.vitaminD = db.vitaminD.filter((r) => r.date !== date);
  saveData();
  res.json({ success: true });
});

// Bath routes
app.get("/api/baths", requireAuth, (req, res) => {
  res.json(db.baths ?? []);
});

app.post("/api/baths", requireAuth, (req, res) => {
  const bath = req.body;
  db.baths.push(bath);
  saveData();
  res.json(bath);
});

// Belly button routes
app.get("/api/belly-button", requireAuth, (req, res) => {
  res.json(db.bellyButton ?? []);
});

app.post("/api/belly-button", requireAuth, (req, res) => {
  const record = req.body;
  const index = db.bellyButton.findIndex((r) => r.date === record.date);
  if (index >= 0) {
    db.bellyButton[index] = record;
  } else {
    db.bellyButton.push(record);
  }
  saveData();
  res.json(record);
});

app.put("/api/belly-button/:date", requireAuth, (req, res) => {
  const { date } = req.params;
  const record = req.body;

  const index = db.bellyButton.findIndex((r) => r.date === date);
  if (index === -1) {
    res.status(404).json({ error: "Belly button record not found" });
    return;
  }

  db.bellyButton[index] = record;
  saveData();
  res.json(record);
});

// Add these before the catch-all route
app.get("/api/diapers", requireAuth, (req, res) => {
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  const recentDiapers = db.diapers.filter(
    (d) => new Date(d.timestamp) >= threeDaysAgo
  );
  res.json(recentDiapers);
});

app.post("/api/diapers", requireAuth, (req, res) => {
  const diaper = req.body;
  db.diapers.push(diaper);
  saveData();
  res.json(diaper);
});

app.delete("/api/diapers/:id", requireAuth, (req, res) => {
  const { id } = req.params;
  db.diapers = db.diapers.filter((d) => d.id !== id);
  saveData();
  res.json({ success: true });
});

// Sleep tracking routes
app.get("/api/sleep", requireAuth, (req, res) => {
  // Return sleep records for the last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentSleep = db.sleep.filter(
    (s) => new Date(s.date) >= sevenDaysAgo
  );
  res.json(recentSleep);
});

app.post("/api/sleep", requireAuth, (req, res) => {
  const sleep = {
    ...req.body,
    updatedAt: new Date().toISOString(),
  };
  
  // If a record for this date exists, update it
  const index = db.sleep.findIndex((s) => s.date === sleep.date);
  if (index >= 0) {
    db.sleep[index] = sleep;
  } else {
    db.sleep.push(sleep);
  }
  
  saveData();
  res.json(sleep);
});

app.put("/api/sleep/:date", requireAuth, (req, res) => {
  const { date } = req.params;
  const sleep = {
    ...req.body,
    updatedAt: new Date().toISOString(),
  };

  const index = db.sleep.findIndex((s) => s.date === date);
  if (index === -1) {
    res.status(404).json({ error: "Sleep record not found" });
    return;
  }

  db.sleep[index] = sleep;
  saveData();
  res.json(sleep);
});

app.delete("/api/sleep/:date", requireAuth, (req, res) => {
  const { date } = req.params;
  db.sleep = db.sleep.filter((s) => s.date !== date);
  saveData();
  res.json({ success: true });
});

// Update the status endpoint to include sleep data
app.get("/api/status", requireAuth, (req, res) => {
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  const recentDiapers = db.diapers.filter(
    (d) => new Date(d.timestamp) >= threeDaysAgo
  );

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentSleep = db.sleep.filter(
    (s) => new Date(s.date) >= sevenDaysAgo
  );

  res.json({
    medications: db.medications,
    feedings: db.feedings,
    vitaminD: db.vitaminD,
    baths: db.baths,
    bellyButton: db.bellyButton,
    diapers: recentDiapers,
    sleep: recentSleep,
  });
});

// Catch-all route for client-side routing - must be last
app.get("*", (req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, "index.html"));
});

// Update the hashPassword function to use the imported crypto
function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

// Start server
loadData().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
