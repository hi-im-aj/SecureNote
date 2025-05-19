import { NextRequest, NextResponse } from "next/server";
import db from "../../../lib/db";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  const user = db.prepare("SELECT * FROM users WHERE username = ? AND password = ?").get(username, password);

  if (user) {
    const response = NextResponse.json({ message: "Logged in" });
    response.cookies.set("session", username);
    return response;
  }

  return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
}
