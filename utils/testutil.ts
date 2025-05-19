import { NextRequest } from "next/server";
import Database from "better-sqlite3";

export function mockNextRequest({
  method,
  json = {},
  cookies = {},
}: {
  method: string;
  json?: any;
  cookies?: Record<string, string>;
}): NextRequest {
  const req = {
    method,
    json: async () => json,
    cookies: {
      get: (name: string) => (cookies[name] ? { value: cookies[name] } : undefined),
    },
    headers: {
      get: () => null,
    },
  } as any;

  return req as NextRequest;
}

export function createTestDatabase() {
  const db = new Database(":memory:");

  db.exec(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT
    )
  `);

  db.exec(`
    CREATE TABLE notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      title TEXT,
      text TEXT,
      created_at TEXT,
      is_public INTEGER,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  return db;
}
