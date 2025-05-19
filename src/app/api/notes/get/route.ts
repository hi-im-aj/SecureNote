import { NextRequest, NextResponse } from "next/server";
import db from "../../../../lib/db";

export async function GET(req: NextRequest) {
  const username = req.cookies.get("session")?.value;

  if (!username) {
    const publicNotes = db
      .prepare(
        "SELECT n.*, u.username FROM notes n JOIN users u ON n.user_id = u.id WHERE n.is_public = 1 ORDER BY n.created_at DESC"
      )
      .all() as Note[];
    return NextResponse.json({ notes: publicNotes });
  }

  const user = db.prepare("SELECT id FROM users WHERE username = ?").get(username) as User | undefined;
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const notes = db
    .prepare(
      `
    SELECT n.*, u.username
    FROM notes n
    JOIN users u ON n.user_id = u.id
    WHERE n.user_id = ? OR n.is_public = 1
    ORDER BY n.created_at DESC
  `
    )
    .all(user.id) as Note[];

  return NextResponse.json({ notes });
}
