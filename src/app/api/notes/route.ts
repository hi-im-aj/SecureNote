import { NextRequest, NextResponse } from "next/server";
import db from "../../../lib/db";

interface NoteInput {
  title: string;
  text: string;
  is_public: boolean;
}

export async function POST(req: NextRequest) {
  const { title, text, is_public } = (await req.json()) as NoteInput;
  const username = req.cookies.get("session")?.value;

  if (!username) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const user = db.prepare("SELECT id FROM users WHERE username = ?").get(username) as User;
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const stmt = db.prepare(`
    INSERT INTO notes (user_id, title, text, created_at, is_public)
    VALUES (?, ?, ?, ?, ?)
  `);
  stmt.run(user.id, title, text, new Date().toISOString(), is_public ? 1 : 0);

  return NextResponse.json({ message: "Note created" }, { status: 201 });
}
