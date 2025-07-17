import express from "express";
import cors from "cors";
import { Database, User, Baby } from "./types";
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
  const required = ["SESSION_SECRET", "INVITATION_CODE"];

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
  users: [],
  babies: [],
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
  if (
    !req.session.authenticated ||
    !req.session.userId ||
    !req.session.babyId
  ) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
};

// Helper function to get current user's baby ID
const getCurrentBabyId = (req: express.Request): string => {
  return req.session.babyId!;
};

// Helper function to generate IDs
const generateId = (): string => {
  return Date.now().toString();
};

// Add this function before loadData()
function migrateDatabase(data: Partial<Database>): Database {
  // Ensure all collections exist with defaults
  const migrated = {
    users: data.users ?? [],
    babies: data.babies ?? [],
    medications: data.medications ?? [],
    feedings: data.feedings ?? [],
    vitaminD: data.vitaminD ?? [],
    baths: data.baths ?? [],
    bellyButton: data.bellyButton ?? [],
    diapers: data.diapers ?? [],
    sleep: data.sleep ?? [],
  };

  // If no users exist, create a default admin user and baby
  if (migrated.users.length === 0) {
    const defaultBaby: Baby = {
      id: generateId(),
      name: "Default Baby",
      dateOfBirth: new Date().toISOString().split("T")[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const defaultUser: User = {
      id: generateId(),
      username: "admin",
      passwordHash: hashPassword("admin"),
      babyId: defaultBaby.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    migrated.babies.push(defaultBaby);
    migrated.users.push(defaultUser);
  }

  // Migrate existing data to include babyId if not present
  const firstBabyId = migrated.babies[0]?.id;
  if (firstBabyId) {
    // Migrate medications
    migrated.medications = migrated.medications.map((med) => ({
      ...med,
      babyId: med.babyId || firstBabyId,
      updatedAt: med.updatedAt || new Date().toISOString(),
    }));

    // Migrate feedings
    migrated.feedings = migrated.feedings.map((feeding) => ({
      ...feeding,
      babyId: feeding.babyId || firstBabyId,
      updatedAt: feeding.updatedAt || new Date().toISOString(),
    }));

    // Migrate vitamin D records
    migrated.vitaminD = migrated.vitaminD.map((record) => ({
      ...record,
      id: record.id || generateId(),
      babyId: record.babyId || firstBabyId,
      updatedAt: record.updatedAt || new Date().toISOString(),
    }));

    // Migrate baths
    migrated.baths = migrated.baths.map((bath) => ({
      ...bath,
      babyId: bath.babyId || firstBabyId,
      updatedAt: bath.updatedAt || new Date().toISOString(),
    }));

    // Migrate belly button records
    migrated.bellyButton = migrated.bellyButton.map((record) => ({
      ...record,
      id: record.id || generateId(),
      babyId: record.babyId || firstBabyId,
      updatedAt: record.updatedAt || new Date().toISOString(),
    }));

    // Migrate diapers
    migrated.diapers = migrated.diapers.map((diaper) => ({
      ...diaper,
      babyId: diaper.babyId || firstBabyId,
      updatedAt: diaper.updatedAt || new Date().toISOString(),
    }));

    // Migrate sleep records
    migrated.sleep = migrated.sleep.map((sleep) => ({
      ...sleep,
      babyId: sleep.babyId || firstBabyId,
      updatedAt: sleep.updatedAt || new Date().toISOString(),
    }));
  }

  return migrated;
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

// User management routes
app.post("/api/register", async (req, res) => {
  const { username, password, babyName, dateOfBirth, invitationCode } =
    req.body;

  if (!username || !password || !babyName || !dateOfBirth || !invitationCode) {
    return res.status(400).json({ error: "All fields are required" });
  }

  // Validate invitation code
  if (invitationCode !== process.env.INVITATION_CODE) {
    return res.status(401).json({ error: "Invalid invitation code" });
  }

  // Check if username already exists
  if (db.users.find((u) => u.username === username)) {
    return res.status(400).json({ error: "Username already exists" });
  }

  // Create baby
  const baby: Baby = {
    id: generateId(),
    name: babyName,
    dateOfBirth,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Create user
  const user: User = {
    id: generateId(),
    username,
    passwordHash: hashPassword(password),
    babyId: baby.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.babies.push(baby);
  db.users.push(user);
  await saveData();

  res.json({ success: true, message: "User registered successfully" });
});

// Auth Routes
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  const user = db.users.find((u) => u.username === username);
  if (!user || user.passwordHash !== hashPassword(password)) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  req.session.authenticated = true;
  req.session.userId = user.id;
  req.session.babyId = user.babyId;

  res.json({ success: true });
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
  if (req.session.authenticated && req.session.userId && req.session.babyId) {
    const user = db.users.find((u) => u.id === req.session.userId);
    const baby = db.babies.find((b) => b.id === req.session.babyId);

    if (user && baby) {
      res.json({
        authenticated: true,
        user: { username: user.username },
        baby: { name: baby.name, dateOfBirth: baby.dateOfBirth },
      });
    } else {
      res.status(401).json({ authenticated: false });
    }
  } else {
    res.status(401).json({ authenticated: false });
  }
});

// Baby management routes
app.get("/api/baby", requireAuth, (req, res) => {
  const baby = db.babies.find((b) => b.id === getCurrentBabyId(req));
  if (!baby) {
    return res.status(404).json({ error: "Baby not found" });
  }
  res.json(baby);
});

app.put("/api/baby", requireAuth, (req, res) => {
  const { name, dateOfBirth } = req.body;
  const babyId = getCurrentBabyId(req);

  const babyIndex = db.babies.findIndex((b) => b.id === babyId);
  if (babyIndex === -1) {
    return res.status(404).json({ error: "Baby not found" });
  }

  db.babies[babyIndex] = {
    ...db.babies[babyIndex],
    name,
    dateOfBirth,
    updatedAt: new Date().toISOString(),
  };

  saveData();
  res.json(db.babies[babyIndex]);
});

// API Routes - now with authentication and baby filtering
app.get("/api/medications", requireAuth, (req, res) => {
  const babyId = getCurrentBabyId(req);
  const medications = db.medications.filter((m) => m.babyId === babyId);
  res.json(medications);
});

app.post("/api/medications", requireAuth, (req, res) => {
  const babyId = getCurrentBabyId(req);
  const medication = {
    ...req.body,
    babyId,
    updatedAt: new Date().toISOString(),
  };
  db.medications.push(medication);
  saveData();
  res.json(medication);
});

app.put("/api/medications/:id", requireAuth, (req, res) => {
  const { id } = req.params;
  const babyId = getCurrentBabyId(req);
  const medication = {
    ...req.body,
    babyId,
    updatedAt: new Date().toISOString(),
  };

  const index = db.medications.findIndex(
    (m) => m.id === id && m.babyId === babyId
  );
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
  const babyId = getCurrentBabyId(req);
  db.medications = db.medications.filter(
    (m) => m.id !== id || m.babyId !== babyId
  );
  saveData();
  res.json({ success: true });
});

app.get("/api/feedings", requireAuth, (req, res) => {
  const babyId = getCurrentBabyId(req);
  const feedings = db.feedings.filter((f) => f.babyId === babyId);
  res.json(feedings);
});

app.post("/api/feedings", requireAuth, (req, res) => {
  const babyId = getCurrentBabyId(req);
  const feeding = {
    ...req.body,
    babyId,
    updatedAt: new Date().toISOString(),
  };
  db.feedings.push(feeding);
  saveData();
  res.json(feeding);
});

app.put("/api/feedings/:id", requireAuth, (req, res) => {
  const { id } = req.params;
  const babyId = getCurrentBabyId(req);
  const feeding = {
    ...req.body,
    babyId,
    updatedAt: new Date().toISOString(),
  };

  const index = db.feedings.findIndex(
    (f) => f.id === id && f.babyId === babyId
  );
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
  const babyId = getCurrentBabyId(req);
  db.feedings = db.feedings.filter((f) => f.id !== id || f.babyId !== babyId);
  saveData();
  res.json({ success: true });
});

app.get("/api/vitamin-d", requireAuth, (req, res) => {
  const babyId = getCurrentBabyId(req);
  const vitaminD = db.vitaminD.filter((v) => v.babyId === babyId);
  res.json(vitaminD);
});

app.post("/api/vitamin-d", requireAuth, (req, res) => {
  const babyId = getCurrentBabyId(req);
  const record = {
    ...req.body,
    id: req.body.id || generateId(),
    babyId,
    updatedAt: new Date().toISOString(),
  };

  const index = db.vitaminD.findIndex(
    (r) => r.date === record.date && r.babyId === babyId
  );
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
  const babyId = getCurrentBabyId(req);
  const record = {
    ...req.body,
    babyId,
    updatedAt: new Date().toISOString(),
  };

  const index = db.vitaminD.findIndex(
    (r) => r.date === date && r.babyId === babyId
  );
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
  const babyId = getCurrentBabyId(req);
  db.vitaminD = db.vitaminD.filter(
    (r) => r.date !== date || r.babyId !== babyId
  );
  saveData();
  res.json({ success: true });
});

// Bath routes
app.get("/api/baths", requireAuth, (req, res) => {
  const babyId = getCurrentBabyId(req);
  const baths = db.baths.filter((b) => b.babyId === babyId);
  res.json(baths);
});

app.post("/api/baths", requireAuth, (req, res) => {
  const babyId = getCurrentBabyId(req);
  const bath = {
    ...req.body,
    babyId,
    updatedAt: new Date().toISOString(),
  };
  db.baths.push(bath);
  saveData();
  res.json(bath);
});

// Belly button routes
app.get("/api/belly-button", requireAuth, (req, res) => {
  const babyId = getCurrentBabyId(req);
  const bellyButton = db.bellyButton.filter((b) => b.babyId === babyId);
  res.json(bellyButton);
});

app.post("/api/belly-button", requireAuth, (req, res) => {
  const babyId = getCurrentBabyId(req);
  const record = {
    ...req.body,
    id: req.body.id || generateId(),
    babyId,
    updatedAt: new Date().toISOString(),
  };

  const index = db.bellyButton.findIndex(
    (r) => r.date === record.date && r.babyId === babyId
  );
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
  const babyId = getCurrentBabyId(req);
  const record = {
    ...req.body,
    babyId,
    updatedAt: new Date().toISOString(),
  };

  const index = db.bellyButton.findIndex(
    (r) => r.date === date && r.babyId === babyId
  );
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
  const babyId = getCurrentBabyId(req);
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  const recentDiapers = db.diapers.filter(
    (d) => d.babyId === babyId && new Date(d.timestamp) >= threeDaysAgo
  );
  res.json(recentDiapers);
});

app.post("/api/diapers", requireAuth, (req, res) => {
  const babyId = getCurrentBabyId(req);
  const diaper = {
    ...req.body,
    babyId,
    updatedAt: new Date().toISOString(),
  };
  db.diapers.push(diaper);
  saveData();
  res.json(diaper);
});

app.delete("/api/diapers/:id", requireAuth, (req, res) => {
  const { id } = req.params;
  const babyId = getCurrentBabyId(req);
  db.diapers = db.diapers.filter((d) => d.id !== id || d.babyId !== babyId);
  saveData();
  res.json({ success: true });
});

// Sleep tracking routes
app.get("/api/sleep", requireAuth, (req, res) => {
  const babyId = getCurrentBabyId(req);
  // Return sleep records for the last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentSleep = db.sleep.filter(
    (s) => s.babyId === babyId && new Date(s.date) >= sevenDaysAgo
  );
  res.json(recentSleep);
});

app.post("/api/sleep", requireAuth, (req, res) => {
  const babyId = getCurrentBabyId(req);
  const sleep = {
    ...req.body,
    babyId,
    updatedAt: new Date().toISOString(),
  };

  // If a record for this date exists, update it
  const index = db.sleep.findIndex(
    (s) => s.date === sleep.date && s.babyId === babyId
  );
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
  const babyId = getCurrentBabyId(req);
  const sleep = {
    ...req.body,
    babyId,
    updatedAt: new Date().toISOString(),
  };

  const index = db.sleep.findIndex(
    (s) => s.date === date && s.babyId === babyId
  );
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
  const babyId = getCurrentBabyId(req);
  db.sleep = db.sleep.filter((s) => s.date !== date || s.babyId !== babyId);
  saveData();
  res.json({ success: true });
});

// Update the status endpoint to include sleep data and filter by baby
app.get("/api/status", requireAuth, (req, res) => {
  const babyId = getCurrentBabyId(req);

  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  const recentDiapers = db.diapers.filter(
    (d) => d.babyId === babyId && new Date(d.timestamp) >= threeDaysAgo
  );

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentSleep = db.sleep.filter(
    (s) => s.babyId === babyId && new Date(s.date) >= sevenDaysAgo
  );

  res.json({
    medications: db.medications.filter((m) => m.babyId === babyId),
    feedings: db.feedings.filter((f) => f.babyId === babyId),
    vitaminD: db.vitaminD.filter((v) => v.babyId === babyId),
    baths: db.baths.filter((b) => b.babyId === babyId),
    bellyButton: db.bellyButton.filter((b) => b.babyId === babyId),
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
