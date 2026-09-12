import { NextResponse } from "next/server";
import { upsertAttendeeByPhone } from "@/lib/db/attendees";
import { allowJoinAttempt, callerIp } from "@/lib/db/rate-limit";
import { findApprovedCity, findOrCreatePendingCity } from "@/lib/db/cities";
import { findCountry } from "@/lib/utils/countries";
import { updateSheetQuietly } from "@/lib/sheets/sync";
import { looksLikeAPhoneNumber, toE164 } from "@/lib/utils/phone";

const FRIENDLY_SAVE_ERROR = "Could not save. Please try again.";
const TOO_MANY = "Too many tries. Please wait a little and try again.";

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

  // A hidden box no real person can see. Only automatic form fillers fill it
  // in. Act as if the save worked, but keep nothing.
  if (asString(data.website)) {
    return NextResponse.json({ ok: true, name });
  }

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
    if (!(await allowJoinAttempt(callerIp(request)))) {
      return NextResponse.json({ error: TOO_MANY }, { status: 429 });
    }

    // A picked city must really belong to the chosen country. Anything else,
    // including typed text, becomes a location for the organiser to check.
    const picked = cityId ? await findApprovedCity(cityId, country.code) : null;
    const city =
      picked ?? (await findOrCreatePendingCity(cityRaw, country.code, country.name));

    const { created } = await upsertAttendeeByPhone({
      name,
      phone,
      phoneRaw,
      countryCode: country.code,
      cityId: city._id,
      cityRaw,
    });

    await updateSheetQuietly();

    return NextResponse.json({ ok: true, name, alreadyJoined: !created });
  } catch {
    return NextResponse.json({ error: FRIENDLY_SAVE_ERROR }, { status: 500 });
  }
}
