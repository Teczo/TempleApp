import { Collection, ObjectId } from "mongodb";
import { getDb } from "./client.ts";

export interface User {
  _id: ObjectId;
  email: string;
  passwordHash: string;
  name: string;
  createdAt: Date;
}

async function usersCollection(): Promise<Collection<User>> {
  const db = await getDb();
  return db.collection<User>("users");
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const col = await usersCollection();
  return col.findOne({ email: email.trim().toLowerCase() });
}
