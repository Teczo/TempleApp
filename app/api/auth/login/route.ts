import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { findUserByEmail } from "@/lib/db/users";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  createSessionToken,
  hasSessionSecret,
} from "@/lib/auth/session";

const WRONG_DETAILS = "Email or password is not correct.";
const NO_DATABASE = "Could not reach the class list. Please try again.";
const NOT_SET_UP = "The app is missing a setting, so nobody can log in yet.";

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  // Checked first. Without it a correct password still could not sign you in.
  if (!hasSessionSecret()) {
    return NextResponse.json({ error: NOT_SET_UP }, { status: 500 });
  }

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
    return NextResponse.json({ error: NO_DATABASE }, { status: 500 });
  }

  // Always run a compare so a missing email takes the same time as a wrong
  // password. This stops someone guessing which emails exist.
  const hash = user?.passwordHash ?? "$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidi";
  const matches = await bcrypt.compare(password, hash);

  if (!user || !matches) {
    return NextResponse.json({ error: WRONG_DETAILS }, { status: 401 });
  }

  let token: string;
  try {
    token = await createSessionToken({
      userId: user._id.toString(),
      name: user.name,
    });
  } catch {
    return NextResponse.json({ error: NOT_SET_UP }, { status: 500 });
  }

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
