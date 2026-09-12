import { ObjectId, type Document } from "mongodb";
import { getDb } from "./client.ts";

/** One person, with the name of their city already filled in. */
export interface AttendeeRow {
  id: string;
  name: string;
  phone: string;
  cityName: string;
  region: string;
  country: string;
  joined: Date;
}

const WITH_CITY: Document[] = [
  {
    $lookup: {
      from: "cities",
      localField: "cityId",
      foreignField: "_id",
      as: "city",
    },
  },
  { $sort: { name: 1 } },
];

interface RawRow {
  _id: ObjectId;
  name: string;
  phone: string;
  createdAt: Date;
  city: Array<{ name: string; region: string; country: string }>;
}

async function run(match: Document, limit?: number): Promise<AttendeeRow[]> {
  const db = await getDb();
  const stages: Document[] = [{ $match: match }, ...WITH_CITY];
  if (limit) stages.push({ $limit: limit });

  const rows = await db
    .collection("attendees")
    .aggregate<RawRow>(stages)
    .toArray();

  return rows.map((row) => ({
    id: row._id.toString(),
    name: row.name,
    phone: row.phone ?? "",
    cityName: row.city[0]?.name ?? "Location not set",
    region: row.city[0]?.region ?? "",
    country: row.city[0]?.country ?? "",
    joined: row.createdAt,
  }));
}

/** Looks for the typed words in the name and in the phone number. */
export async function searchAttendees(query: string): Promise<AttendeeRow[]> {
  const typed = query.trim();
  if (!typed) return [];

  const safe = typed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const digits = typed.replace(/\D/g, "");

  const orParts: Document[] = [{ name: { $regex: safe, $options: "i" } }];
  if (digits) orParts.push({ phone: { $regex: digits } });

  return run({ status: "active", $or: orParts }, 50);
}

/** Everybody on the list, used for the Excel file. */
export async function listAllActiveAttendees(): Promise<AttendeeRow[]> {
  return run({ status: "active" });
}
