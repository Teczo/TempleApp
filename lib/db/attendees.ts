import { Collection, ObjectId } from "mongodb";
import { getDb } from "./client.ts";

export type AttendeeStatus = "active" | "removed";
export type AttendeeSource = "link" | "import";

export interface Attendee {
  _id: ObjectId;
  name: string;
  phone: string;
  phoneRaw: string;
  countryCode: string;
  cityId: ObjectId | null;
  cityRaw: string;
  status: AttendeeStatus;
  source: AttendeeSource;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewAttendee {
  name: string;
  phone: string;
  phoneRaw: string;
  countryCode: string;
  cityId: ObjectId | null;
  cityRaw: string;
}

/** One row of the dashboard city list. */
export interface CityGroup {
  cityId: string | null;
  cityName: string;
  region: string;
  country: string;
  status: "approved" | "pending" | "none";
  count: number;
}

async function attendeesCollection(): Promise<Collection<Attendee>> {
  const db = await getDb();
  return db.collection<Attendee>("attendees");
}

export async function createAttendee(input: NewAttendee): Promise<void> {
  const now = new Date();
  const col = await attendeesCollection();
  await col.insertOne({
    _id: new ObjectId(),
    ...input,
    status: "active",
    source: "link",
    createdAt: now,
    updatedAt: now,
  });
}

export async function countActiveAttendees(): Promise<number> {
  const col = await attendeesCollection();
  return col.countDocuments({ status: "active" });
}

export async function listAttendeesByCity(cityId: string): Promise<Attendee[]> {
  if (!ObjectId.isValid(cityId)) return [];
  const col = await attendeesCollection();
  return col
    .find({ status: "active", cityId: new ObjectId(cityId) })
    .sort({ name: 1 })
    .toArray();
}

/** Counts active people per city, biggest city first. */
export async function groupAttendeesByCity(): Promise<CityGroup[]> {
  const col = await attendeesCollection();
  const rows = await col
    .aggregate<{
      _id: ObjectId | null;
      count: number;
      city: Array<{ name: string; region: string; country: string; status: string }>;
    }>([
      { $match: { status: "active" } },
      { $group: { _id: "$cityId", count: { $sum: 1 } } },
      {
        $lookup: {
          from: "cities",
          localField: "_id",
          foreignField: "_id",
          as: "city",
        },
      },
      { $sort: { count: -1 } },
    ])
    .toArray();

  return rows.map((row) => {
    const city = row.city[0];
    return {
      cityId: row._id ? row._id.toString() : null,
      cityName: city ? city.name : "Location not set",
      region: city?.region ?? "",
      country: city?.country ?? "",
      status: city ? (city.status as "approved" | "pending") : "none",
      count: row.count,
    };
  });
}

/** Used when the organiser says one location is the same as another. */
export async function moveAttendeesToCity(
  fromCityId: string,
  toCityId: string,
): Promise<number> {
  if (!ObjectId.isValid(fromCityId) || !ObjectId.isValid(toCityId)) return 0;
  const col = await attendeesCollection();
  const result = await col.updateMany(
    { cityId: new ObjectId(fromCityId) },
    { $set: { cityId: new ObjectId(toCityId), updatedAt: new Date() } },
  );
  return result.modifiedCount;
}

export async function countAttendeesInCity(cityId: string): Promise<number> {
  if (!ObjectId.isValid(cityId)) return 0;
  const col = await attendeesCollection();
  return col.countDocuments({ status: "active", cityId: new ObjectId(cityId) });
}
