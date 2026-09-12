import { NextResponse } from "next/server";
import { createAttendee } from "@/lib/db/attendees";
import { findApprovedCity, findOrCreatePendingCity } from "@/lib/db/cities";
import { findCountry } from "@/lib/utils/countries";
import { looksLikeAPhoneNumber, toE164 } from "@/lib/utils/phone";

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
  const cityId = asString(data.cityId);
  const country = findCountry(asString(data.countryCode));

  if (!name) {
    return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
  }
  if (!country) {
    return NextResponse.json({ error: "Please choose your country." }, { status: 400 });
  }
  if (!phoneRaw) {
    return NextResponse.json({ error: "Please enter your phone number." }, { status: 400 });
  }
  if (!cityRaw) {
    return NextResponse.json({ error: "Please enter your city." }, { status: 400 });
  }

  const phone = toE164(phoneRaw, country.code);
  if (!looksLikeAPhoneNumber(phone)) {
    return NextResponse.json(
      { error: "That phone number does not look right. Please check it." },
      { status: 400 },
    );
  }

  try {
    // A picked city must really belong to the chosen country. Anything else,
    // including typed text, becomes a location for the organiser to check.
    const picked = cityId ? await findApprovedCity(cityId, country.code) : null;
    const city =
      picked ?? (await findOrCreatePendingCity(cityRaw, country.code, country.name));

    await createAttendee({
      name,
      phone,
      phoneRaw,
      countryCode: country.code,
      cityId: city._id,
      cityRaw,
    });
  } catch (error) {
    if (isDuplicatePhone(error)) {
      return NextResponse.json({ error: "You are already registered." }, { status: 409 });
    }
    return NextResponse.json({ error: FRIENDLY_SAVE_ERROR }, { status: 500 });
  }

  return NextResponse.json({ ok: true, name });
}

function isDuplicatePhone(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error &&
    (error as { code: unknown }).code === 11000;
}
