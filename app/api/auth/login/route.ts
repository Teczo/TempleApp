import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { findUserByEmail } from "@/lib/db/users";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  createSessionToken,
} from "@/lib/auth/session";

const WRONG_DETAILS = "Email or password is not correct.";

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: WRONG_DETAILS }, { status: 400 });
  }

  const data = (body ?? {}) as Record<string, unknown>;
  const email = asString(data.email).toLowerCase();
  const password = typeof data.password === "string" ? data.password : "";

  if (!email || !password) {
    return NextResponse.json({ error: WRONG_DETAILS }, { status: 401 });
  }

  let user: Awaited<ReturnType<typeof findUserByEmail>>;
  try {
    user = await findUserByEmail(email);
  } catch {
    return NextResponse.json(
      { error: "Could not log in right now. Please try again." },
      { status: 500 },
    );
  }

  // Always run a compare so a missing email takes the same time as a wrong
  // password. This stops someone guessing which emails exist.
  const hash = user?.passwordHash ?? "$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidi";
  const matches = await bcrypt.compare(password, hash);

  if (!user || !matches) {
    return NextResponse.json({ error: WRONG_DETAILS }, { status: 401 });
  }

  const token = await createSessionToken({
    userId: user._id.toString(),
    name: user.name,
  });

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return response;
}
