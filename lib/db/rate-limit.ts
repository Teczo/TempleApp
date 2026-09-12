import { ObjectId } from "mongodb";
import { getDb } from "./client.ts";

const WINDOW_SECONDS = 60 * 60;
const MAX_JOINS_PER_HOUR = 5;

let indexReady = false;

/**
 * Stops one person sending the join form over and over. Attempts are kept in
 * the database, because the app runs on several servers at once and a count
 * held in one server's memory would not be shared.
 * Returns true when the submit is allowed.
 */
export async function allowJoinAttempt(ip: string): Promise<boolean> {
  if (!ip) return true;

  const db = await getDb();
  const attempts = db.collection("joinAttempts");

  if (!indexReady) {
    // The database clears old attempts itself once the hour is up.
    await attempts.createIndex({ createdAt: 1 }, { expireAfterSeconds: WINDOW_SECONDS });
    indexReady = true;
  }

  const since = new Date(Date.now() - WINDOW_SECONDS * 1000);
  const used = await attempts.countDocuments({ ip, createdAt: { $gte: since } });
  if (used >= MAX_JOINS_PER_HOUR) return false;

  await attempts.insertOne({ _id: new ObjectId(), ip, createdAt: new Date() });
  return true;
}

/** Works out who sent the request, behind Vercel's servers. */
export function callerIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for") ?? "";
  const first = forwarded.split(",")[0]?.trim();
  return first || request.headers.get("x-real-ip") || "";
}
