import { Collection, ObjectId, type Document } from "mongodb";
import { COUNTRIES } from "../utils/countries.ts";

export interface ImportedPerson {
  name: string;
  phone: string;
  phoneRaw: string;
  countryCode: string;
  cityId: ObjectId | null;
  cityRaw: string;
}

/**
 * Adds one person, or refreshes the person who already has that phone
 * number. This is what makes the import safe to run more than once.
 * A person who joined through the link keeps that history: only the
 * details change, not where they came from.
 */
export async function upsertImportedAttendee(
  attendees: Collection<Document>,
  person: ImportedPerson,
): Promise<"added" | "updated"> {
  const key = person.phone
    ? { phone: person.phone }
    : { source: "import", name: person.name, phoneRaw: person.phoneRaw };

  const result = await attendees.updateOne(
    key,
    {
      $set: { ...person, status: "active", updatedAt: new Date() },
      $setOnInsert: {
        _id: new ObjectId(),
        source: "import",
        createdAt: new Date(),
      },
    },
    { upsert: true },
  );

  return result.upsertedCount > 0 ? "added" : "updated";
}

/**
 * A location nobody has approved yet. The same typed text is reused, so the
 * organiser's review list stays short.
 */
export async function findOrCreatePendingCityFor(
  cities: Collection<Document>,
  typedName: string,
  countryCode: string,
): Promise<{ id: ObjectId; created: boolean }> {
  const name = typedName.trim();
  const existing = await cities.findOne({
    countryCode,
    name: { $regex: `^${escapeForRegex(name)}$`, $options: "i" },
  });
  if (existing) return { id: existing._id as ObjectId, created: false };

  const country = COUNTRIES.find((c) => c.code === countryCode);
  const id = new ObjectId();
  await cities.insertOne({
    _id: id,
    name,
    region: "",
    country: country ? country.name : "",
    countryCode,
    status: "pending",
    createdAt: new Date(),
  });
  return { id, created: true };
}

function escapeForRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
