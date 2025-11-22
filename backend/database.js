import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, 'pokemon.db');

export const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
    initializeDatabase();
  }
});

function initializeDatabase() {
  // Create tables with all columns (SQLite will ignore if they already exist)
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      chosen_pokemon_id INTEGER,
      trophies INTEGER DEFAULT 0,
      coins INTEGER DEFAULT 100,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS user_pokemon (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      pokemon_id INTEGER NOT NULL,
      pokemon_name TEXT NOT NULL,
      pokemon_data TEXT NOT NULL,
      is_starter BOOLEAN DEFAULT 0,
      level INTEGER DEFAULT 5,
      experience INTEGER DEFAULT 0,
      obtained_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS user_battles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      opponent_pokemon_data TEXT NOT NULL,
      result TEXT NOT NULL,
      trophies_earned INTEGER DEFAULT 0,
      coins_earned INTEGER DEFAULT 0,
      battle_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);

  // Try to add missing columns with error handling
  addColumnSafely('users', 'trophies', 'INTEGER DEFAULT 0');
  addColumnSafely('users', 'coins', 'INTEGER DEFAULT 100');
  addColumnSafely('user_pokemon', 'level', 'INTEGER DEFAULT 5');
  addColumnSafely('user_pokemon', 'experience', 'INTEGER DEFAULT 0');
}

function addColumnSafely(table, column, definition) {
  db.run(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`, (err) => {
    if (err) {
      // Column likely already exists, which is fine
      console.log(`Column ${column} already exists in ${table} table`);
    } else {
      console.log(`Added ${column} column to ${table} table`);
    }
  });
}