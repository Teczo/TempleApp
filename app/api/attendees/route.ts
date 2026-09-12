import { NextResponse } from "next/server";
import { createAttendee } from "@/lib/db/attendees";
import { cleanPhone } from "@/lib/utils/phone";

const FRIENDLY_SAVE_ERROR = "Could not save. Please try again.";

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: FRIENDLY_SAVE_ERROR }, { status: 400 });
  }

  const data = (body ?? {}) as Record<string, unknown>;
  const name = asString(data.name);
  const phoneRaw = asString(data.phone);
  const cityRaw = asString(data.city);

  if (!name) {
    return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
  }
  if (!phoneRaw) {
    return NextResponse.json({ error: "Please enter your phone number." }, { status: 400 });
  }
  if (!cityRaw) {
    return NextResponse.json({ error: "Please enter your city." }, { status: 400 });
  }

  const phone = cleanPhone(phoneRaw);
  if (phone.replace(/\D/g, "").length < 6) {
    return NextResponse.json(
      { error: "That phone number does not look right. Please check it." },
      { status: 400 },
    );
  }

  try {
    await createAttendee({ name, phone, phoneRaw, countryCode: "", cityRaw });
  } catch {
    return NextResponse.json({ error: FRIENDLY_SAVE_ERROR }, { status: 500 });
  }

  return NextResponse.json({ ok: true, name });
}
