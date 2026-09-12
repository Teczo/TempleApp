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

export interface UpsertResult {
  /** True when this phone number was not in the list before. */
  created: boolean;
}

/**
 * Saves a person from the join link. Somebody who is already in the list
 * has their details refreshed instead of being added a second time.
 */
export async function upsertAttendeeByPhone(
  input: NewAttendee,
): Promise<UpsertResult> {
  const now = new Date();
  const col = await attendeesCollection();
  const result = await col.updateOne(
    { phone: input.phone },
    {
      $set: { ...input, status: "active", updatedAt: now },
      $setOnInsert: {
        _id: new ObjectId(),
        source: "link" as AttendeeSource,
        createdAt: now,
      },
    },
    { upsert: true },
  );
  return { created: result.upsertedCount > 0 };
}

export async function findAttendeeById(id: string): Promise<Attendee | null> {
  if (!ObjectId.isValid(id)) return null;
  const col = await attendeesCollection();
  return col.findOne({ _id: new ObjectId(id) });
}

export interface AttendeeEdit {
  name: string;
  phone: string;
  phoneRaw: string;
  countryCode: string;
  cityId: ObjectId | null;
  cityRaw: string;
}

/** Saving a person also puts them back on the list if they were taken off. */
export async function updateAttendee(id: string, edit: AttendeeEdit): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false;
  const col = await attendeesCollection();
  const result = await col.updateOne(
    { _id: new ObjectId(id) },
    { $set: { ...edit, status: "active", updatedAt: new Date() } },
  );
  return result.matchedCount === 1;
}

/** Taking someone off the list keeps their row, so nothing is lost. */
export async function removeAttendee(id: string): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false;
  const col = await attendeesCollection();
  const result = await col.updateOne(
    { _id: new ObjectId(id) },
    { $set: { status: "removed", updatedAt: new Date() } },
  );
  return result.matchedCount === 1;
}
