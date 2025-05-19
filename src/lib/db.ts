import Database from "better-sqlite3";

const db = new Database("secure_note.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS

 notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    title TEXT,
    text TEXT,
    created_at TEXT,
    is_public INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`);

export default db;
