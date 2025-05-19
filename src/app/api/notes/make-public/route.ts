import { NextRequest, NextResponse } from "next/server";
import db from "../../../../lib/db";

interface RequestBody {
  noteId: number;
}

export async function POST(req: NextRequest) {
  const { noteId } = (await req.json()) as RequestBody;
  const username = req.cookies.get("session")?.value;

  if (!username) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const user = db.prepare("SELECT id FROM users WHERE username = ?").get(username) as User | undefined;
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const stmt = db.prepare("UPDATE notes SET is_public = 1 WHERE id = ?");
  const result = stmt.run(noteId);

  if (result.changes === 0) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }

  return NextResponse.json({ message: "Note made public" }, { status: 200 });
}
