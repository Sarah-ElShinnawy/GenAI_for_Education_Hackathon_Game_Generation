import fs from 'fs';
import path from 'path';

export interface StoredGame {
  id: string;
  topic: string;
  level: string;
  sourceType: string;
  title: string;
  html: string;
  takeaways: string[];
  objectives: Array<{ label: string; done: boolean }>;
  createdAt: string;
}

export interface StoredContactMessage {
  id: string;
  name: string;
  email: string;
  role: string;
  subject: string;
  message: string;
  createdAt: string;
}

export interface StoredDocument {
  id: string;
  name: string;
  format: string;
  slides: any[];
  createdAt: string;
}

interface DatabaseSchema {
  games: StoredGame[];
  contactMessages: StoredContactMessage[];
  documents: StoredDocument[];
}

// In-memory cache + persistent file fallback for Vercel/Local
let memoryDb: DatabaseSchema = {
  games: [],
  contactMessages: [],
  documents: [],
};

function getStorageFilePath(): string {
  // On Vercel serverless, /tmp is writable
  const isVercel = process.env.VERCEL === '1';
  if (isVercel) {
    return '/tmp/eduplay_db.json';
  }
  const dir = path.join(process.cwd(), '.data');
  if (!fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true });
    } catch {}
  }
  return path.join(dir, 'db.json');
}

function loadDb(): DatabaseSchema {
  try {
    const filePath = getStorageFilePath();
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf8');
      const parsed = JSON.parse(raw);
      memoryDb = {
        games: Array.isArray(parsed.games) ? parsed.games : [],
        contactMessages: Array.isArray(parsed.contactMessages) ? parsed.contactMessages : [],
        documents: Array.isArray(parsed.documents) ? parsed.documents : [],
      };
    }
  } catch (err) {
    console.warn('DB load notice:', err);
  }
  return memoryDb;
}

function persistDb(): void {
  try {
    const filePath = getStorageFilePath();
    fs.writeFileSync(filePath, JSON.stringify(memoryDb, null, 2), 'utf8');
  } catch (err) {
    console.warn('DB persist notice:', err);
  }
}

/**
 * Save a newly synthesized game to the database
 */
export async function saveGame(gameData: Omit<StoredGame, 'id' | 'createdAt'>): Promise<StoredGame> {
  const db = loadDb();
  const newGame: StoredGame = {
    ...gameData,
    id: `game_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    createdAt: new Date().toISOString(),
  };

  db.games.unshift(newGame);
  if (db.games.length > 100) {
    db.games = db.games.slice(0, 100);
  }
  persistDb();
  return newGame;
}

/**
 * Get recent games from the database
 */
export async function getRecentGames(limit: number = 20): Promise<StoredGame[]> {
  const db = loadDb();
  return db.games.slice(0, limit);
}

/**
 * Get game by ID
 */
export async function getGameById(id: string): Promise<StoredGame | null> {
  const db = loadDb();
  return db.games.find((g) => g.id === id) || null;
}

/**
 * Save contact inquiry to the database
 */
export async function saveContactMessage(
  data: Omit<StoredContactMessage, 'id' | 'createdAt'>
): Promise<StoredContactMessage> {
  const db = loadDb();
  const msg: StoredContactMessage = {
    ...data,
    id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    createdAt: new Date().toISOString(),
  };

  db.contactMessages.unshift(msg);
  persistDb();
  return msg;
}
