import { cookies } from "next/headers";
import { SESSION_COOKIE, readSessionToken, type SessionUser } from "./session.ts";

/** For route handlers the organiser uses. Returns null when not logged in. */
export async function currentOrganiser(): Promise<SessionUser | null> {
  const store = await cookies();
  return readSessionToken(store.get(SESSION_COOKIE)?.value);
}
