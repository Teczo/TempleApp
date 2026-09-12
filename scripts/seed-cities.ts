/**
 * Adds the starting list of locations, and the database indexes from
 * Section 4 of the contract. Safe to run as many times as you like.
 *
 *   npm run seed:cities
 */
import { MongoClient, ObjectId } from "mongodb";
import { CITY_SEEDS } from "../lib/db/city-seed-data.ts";

async function main(): Promise<void> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    process.stderr.write(
      "The database address is missing. Put MONGODB_URI in your .env.local file.\n",
    );
    process.exit(1);
  }

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db("thiruppugazh");
    const cities = db.collection("cities");
    const attendees = db.collection("attendees");

    await cities.createIndex({ countryCode: 1, name: 1 });
    await cities.createIndex({ status: 1 });
    // Unique, but only for people who have a phone number. Phase 4 imports
    // some people with an empty phone, and several empty ones must be allowed.
    await attendees.createIndex(
      { phone: 1 },
      { unique: true, partialFilterExpression: { phone: { $gt: "" } } },
    );
    await attendees.createIndex({ cityId: 1 });

    let added = 0;
    let alreadyThere = 0;

    for (const seed of CITY_SEEDS) {
      const result = await cities.updateOne(
        { countryCode: seed.countryCode, name: seed.name },
        {
          $set: {
            name: seed.name,
            region: seed.region,
            country: seed.country,
            countryCode: seed.countryCode,
            status: "approved",
          },
          $setOnInsert: { _id: new ObjectId(), createdAt: new Date() },
        },
        { upsert: true },
      );
      if (result.upsertedCount > 0) added++;
      else alreadyThere++;
    }

    process.stdout.write(
      `Locations added: ${added}\n` +
        `Locations already there: ${alreadyThere}\n` +
        `Total starting locations: ${CITY_SEEDS.length}\n`,
    );
  } finally {
    await client.close();
  }
}

main().catch(() => {
  process.stderr.write(
    "Could not add the locations. Check your database address and try again.\n",
  );
  process.exit(1);
});
