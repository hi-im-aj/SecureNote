import { NextRequest, NextResponse } from "next/server";
import db from "../../../lib/db";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  try {
    const stmt = db.prepare("INSERT INTO users (username, password) VALUES (?, ?)");
    stmt.run(username, password);
    return NextResponse.json({ message: "User registered" }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Username taken" }, { status: 400 });
  }
}
