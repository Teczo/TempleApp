import { Collection, ObjectId } from "mongodb";
import { getDb } from "./client";

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
  cityRaw: string;
}

async function attendees(): Promise<Collection<Attendee>> {
  const db = await getDb();
  return db.collection<Attendee>("attendees");
}

export async function createAttendee(input: NewAttendee): Promise<void> {
  const now = new Date();
  const col = await attendees();
  await col.insertOne({
    _id: new ObjectId(),
    name: input.name,
    phone: input.phone,
    phoneRaw: input.phoneRaw,
    countryCode: input.countryCode,
    cityId: null,
    cityRaw: input.cityRaw,
    status: "active",
    source: "link",
    createdAt: now,
    updatedAt: now,
  });
}

export async function listActiveAttendees(): Promise<Attendee[]> {
  const col = await attendees();
  return col.find({ status: "active" }).sort({ createdAt: -1 }).toArray();
}
