import { Collection, ObjectId } from "mongodb";
import { getDb } from "./client.ts";

export type CityStatus = "approved" | "pending";

export interface City {
  _id: ObjectId;
  name: string;
  region: string;
  country: string;
  countryCode: string;
  status: CityStatus;
  createdAt: Date;
}

async function citiesCollection(): Promise<Collection<City>> {
  const db = await getDb();
  return db.collection<City>("cities");
}

export async function listApprovedCities(countryCode: string): Promise<City[]> {
  const col = await citiesCollection();
  return col
    .find({ status: "approved", countryCode: countryCode.toUpperCase() })
    .sort({ name: 1 })
    .toArray();
}

export async function listAllApprovedCities(): Promise<City[]> {
  const col = await citiesCollection();
  return col.find({ status: "approved" }).sort({ name: 1 }).toArray();
}

export async function listPendingCities(): Promise<City[]> {
  const col = await citiesCollection();
  return col.find({ status: "pending" }).sort({ createdAt: 1 }).toArray();
}

export async function countPendingCities(): Promise<number> {
  const col = await citiesCollection();
  return col.countDocuments({ status: "pending" });
}

export async function findCityById(id: string): Promise<City | null> {
  if (!ObjectId.isValid(id)) return null;
  const col = await citiesCollection();
  return col.findOne({ _id: new ObjectId(id) });
}

/**
 * Finds the approved city the person picked. Returns null when the id does
 * not belong to the chosen country, so a tampered form cannot cross-link.
 */
export async function findApprovedCity(
  id: string,
  countryCode: string,
): Promise<City | null> {
  if (!ObjectId.isValid(id)) return null;
  const col = await citiesCollection();
  return col.findOne({
    _id: new ObjectId(id),
    status: "approved",
    countryCode: countryCode.toUpperCase(),
  });
}

/**
 * A city the organiser has not seen before. Reuses an existing entry when
 * someone already typed the same thing, so the review list stays short.
 */
export async function findOrCreatePendingCity(
  typedName: string,
  countryCode: string,
  countryName: string,
): Promise<City> {
  const name = typedName.trim();
  const col = await citiesCollection();
  const code = countryCode.toUpperCase();

  const existing = await col.findOne({
    countryCode: code,
    name: { $regex: `^${escapeForRegex(name)}$`, $options: "i" },
  });
  if (existing) return existing;

  const city: City = {
    _id: new ObjectId(),
    name,
    region: "",
    country: countryName,
    countryCode: code,
    status: "pending",
    createdAt: new Date(),
  };
  await col.insertOne(city);
  return city;
}

export async function approveCity(id: string): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false;
  const col = await citiesCollection();
  const result = await col.updateOne(
    { _id: new ObjectId(id), status: "pending" },
    { $set: { status: "approved" } },
  );
  return result.matchedCount === 1;
}

export async function deleteCity(id: string): Promise<void> {
  if (!ObjectId.isValid(id)) return;
  const col = await citiesCollection();
  await col.deleteOne({ _id: new ObjectId(id) });
}

function escapeForRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
