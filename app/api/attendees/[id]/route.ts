import { NextResponse } from "next/server";
import { currentOrganiser } from "@/lib/auth/require-login";
import { removeAttendee, updateAttendee } from "@/lib/db/attendees";
import { findApprovedCity, findOrCreatePendingCity } from "@/lib/db/cities";
import { findCountry } from "@/lib/utils/countries";
import { looksLikeAPhoneNumber, toE164 } from "@/lib/utils/phone";

const TRY_AGAIN = "Could not save that change. Please try again.";

interface Context {
  params: Promise<{ id: string }>;
}

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function PATCH(request: Request, context: Context) {
  if (!(await currentOrganiser())) {
    return NextResponse.json({ error: "Please log in again." }, { status: 401 });
  }

  const { id } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: TRY_AGAIN }, { status: 400 });
  }

  const data = (body ?? {}) as Record<string, unknown>;
  const name = asString(data.name);
  const phoneRaw = asString(data.phone);
  const cityRaw = asString(data.city);
  const cityId = asString(data.cityId);
  const country = findCountry(asString(data.countryCode));

  if (!name) {
    return NextResponse.json({ error: "Please enter a name." }, { status: 400 });
  }
  if (!country) {
    return NextResponse.json({ error: "Please choose a country." }, { status: 400 });
  }
  if (!cityRaw) {
    return NextResponse.json({ error: "Please enter a city." }, { status: 400 });
  }

  // An empty box is allowed here: a few people came across with no number.
  const phone = phoneRaw ? toE164(phoneRaw, country.code) : "";
  if (phoneRaw && !looksLikeAPhoneNumber(phone)) {
    return NextResponse.json(
      { error: "That phone number does not look right. Please check it." },
      { status: 400 },
    );
  }

  try {
    const picked = cityId ? await findApprovedCity(cityId, country.code) : null;
    const city =
      picked ?? (await findOrCreatePendingCity(cityRaw, country.code, country.name));

    const saved = await updateAttendee(id, {
      name,
      phone,
      phoneRaw,
      countryCode: country.code,
      cityId: city._id,
      cityRaw,
    });
    if (!saved) {
      return NextResponse.json({ error: "That person is no longer on the list." }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (isDuplicatePhone(error)) {
      return NextResponse.json(
        { error: "Somebody else already has that phone number." },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: TRY_AGAIN }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: Context) {
  if (!(await currentOrganiser())) {
    return NextResponse.json({ error: "Please log in again." }, { status: 401 });
  }

  const { id } = await context.params;
  try {
    const done = await removeAttendee(id);
    if (!done) {
      return NextResponse.json({ error: "That person is no longer on the list." }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Could not take that person off the list. Please try again." },
      { status: 500 },
    );
  }
}

function isDuplicatePhone(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error &&
    (error as { code: unknown }).code === 11000;
}
