/**
 * Brings the old spreadsheet of attendees into the database.
 * Safe to run more than once: people are matched on their phone number.
 *
 *   npm run import -- --file=./data/attendees.csv
 */
import { readFileSync } from "node:fs";
import { MongoClient, ObjectId } from "mongodb";
import { parseCsv } from "../lib/utils/csv.ts";
import { cleanImportedPhone } from "../lib/utils/import-phone.ts";
import { matchCity, type KnownCity } from "../lib/utils/import-city.ts";
import { DEFAULT_COUNTRY_CODE } from "../lib/utils/countries.ts";
import {
  findOrCreatePendingCityFor,
  upsertImportedAttendee,
} from "../lib/db/import.ts";

interface Totals {
  rowsRead: number;
  added: number;
  updated: number;
  skipped: number;
  noPhone: string[];
  newLocations: string[];
}

async function main(): Promise<void> {
  const file = readArgument("file");
  if (!file) {
    fail(
      "Please say which file to read, like: npm run import -- --file=./data/attendees.csv",
    );
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    fail("The database address is missing. Put MONGODB_URI in your .env.local file.");
  }

  let text: string;
  try {
    text = readFileSync(file, "utf8");
  } catch {
    fail(`Could not open the file: ${file}`);
  }

  const rows = parseCsv(text).slice(1);
  const totals: Totals = {
    rowsRead: rows.length,
    added: 0,
    updated: 0,
    skipped: 0,
    noPhone: [],
    newLocations: [],
  };

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db("thiruppugazh");
    const cities = db.collection("cities");
    const attendees = db.collection("attendees");

    const approved = await cities.find({ status: "approved" }).toArray();
    const known: KnownCity[] = approved.map((c) => ({
      name: c.name as string,
      countryCode: c.countryCode as string,
    }));

    for (const row of rows) {
      const person = await readRow(row, known, approved, cities, totals);
      if (!person) continue;
      const outcome = await upsertImportedAttendee(attendees, person);
      if (outcome === "added") totals.added++;
      else totals.updated++;
    }
  } finally {
    await client.close();
  }

  report(totals);
}

/** Turns one spreadsheet row into a person, or null when the row is empty. */
async function readRow(
  row: string[],
  known: KnownCity[],
  approved: Array<Record<string, unknown>>,
  cities: import("mongodb").Collection,
  totals: Totals,
) {
  const name = (row[1] ?? "").trim();
  if (!name) {
    totals.skipped++;
    return null;
  }

  const phoneRaw = (row[2] ?? "").trim();
  const cityRaw = (row[3] ?? "").trim();

  // The location column is read first, because it tells us which country the
  // number belongs to. Some numbers cannot be read correctly without it.
  const match = matchCity(cityRaw, known);

  const { phone, countryCode: phoneCountry } = cleanImportedPhone(
    phoneRaw,
    match.countryCode,
  );
  if (!phone) totals.noPhone.push(`${name} (${phoneRaw || "no number"})`);
  const countryCode = match.countryCode || phoneCountry || DEFAULT_COUNTRY_CODE;

  let cityId: ObjectId | null = null;
  if (match.name) {
    const city = approved.find(
      (c) => c.name === match.name && c.countryCode === countryCode,
    );
    cityId = city ? (city._id as ObjectId) : null;
  } else if (cityRaw) {
    const pending = await findOrCreatePendingCityFor(cities, cityRaw, countryCode);
    cityId = pending.id;
    if (pending.created) totals.newLocations.push(cityRaw);
  }

  return { name, phone, phoneRaw, countryCode, cityId, cityRaw };
}

function report(totals: Totals): void {
  const lines = [
    `Rows read: ${totals.rowsRead}`,
    `People added: ${totals.added}`,
    `People already there, details refreshed: ${totals.updated}`,
    `Rows skipped because the name was blank: ${totals.skipped}`,
    `Phone numbers that could not be read: ${totals.noPhone.length}`,
  ];
  for (const person of totals.noPhone) lines.push(`  - ${person}`);
  if (totals.newLocations.length > 0) {
    lines.push(`New locations to check: ${totals.newLocations.length}`);
    for (const place of totals.newLocations) lines.push(`  - ${place}`);
  }
  process.stdout.write(`${lines.join("\n")}\n`);
}

function readArgument(name: string): string | undefined {
  const prefix = `--${name}=`;
  const found = process.argv.find((arg) => arg.startsWith(prefix));
  return found ? found.slice(prefix.length) : undefined;
}

function fail(message: string): never {
  process.stderr.write(`${message}\n`);
  process.exit(1);
}

main().catch(() => {
  fail("Could not finish the import. Check your database address and try again.");
});
