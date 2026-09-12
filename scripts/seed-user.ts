/**
 * Creates or updates the single organiser login.
 *
 *   npm run seed:user -- --email=x --password=y --name=z
 */
import bcrypt from "bcryptjs";
import { MongoClient, ObjectId } from "mongodb";

function readArg(flag: string): string {
  const prefix = `--${flag}=`;
  const match = process.argv.find((arg) => arg.startsWith(prefix));
  return match ? match.slice(prefix.length).trim() : "";
}

async function main(): Promise<void> {
  const email = readArg("email").toLowerCase();
  const password = readArg("password");
  const name = readArg("name");

  if (!email || !password || !name) {
    process.stderr.write(
      "Please give all three details. For example:\n" +
        '  npm run seed:user -- --email=her@email.com --password="a good password" --name="Her Name"\n',
    );
    process.exit(1);
  }

  if (password.length < 8) {
    process.stderr.write("Please use a password of at least 8 letters.\n");
    process.exit(1);
  }

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
    const users = client.db("thiruppugazh").collection("users");
    const passwordHash = await bcrypt.hash(password, 10);

    const result = await users.updateOne(
      { email },
      {
        $set: { email, passwordHash, name },
        $setOnInsert: { _id: new ObjectId(), createdAt: new Date() },
      },
      { upsert: true },
    );

    const created = result.upsertedCount > 0;
    process.stdout.write(
      created
        ? `Login created for ${email}.\n`
        : `Login updated for ${email}. The old password no longer works.\n`,
    );
  } finally {
    await client.close();
  }
}

main().catch(() => {
  process.stderr.write(
    "Could not save the login. Check your database address and try again.\n",
  );
  process.exit(1);
});
