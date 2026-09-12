import { NextResponse } from "next/server";
import { currentOrganiser } from "@/lib/auth/require-login";
import { moveAttendeesToCity } from "@/lib/db/attendees";
import { approveCity, deleteCity, findCityById } from "@/lib/db/cities";

const TRY_AGAIN = "Could not save that change. Please try again.";

interface Context {
  params: Promise<{ id: string }>;
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
  const action = typeof data.action === "string" ? data.action : "";

  try {
    const city = await findCityById(id);
    if (!city || city.status !== "pending") {
      return NextResponse.json(
        { error: "That location is no longer waiting to be checked." },
        { status: 404 },
      );
    }

    if (action === "approve") {
      const done = await approveCity(id);
      if (!done) return NextResponse.json({ error: TRY_AGAIN }, { status: 409 });
      return NextResponse.json({ ok: true });
    }

    if (action === "merge") {
      const targetId = typeof data.intoCityId === "string" ? data.intoCityId : "";
      const target = await findCityById(targetId);
      if (!target || target.status !== "approved" || target._id.equals(city._id)) {
        return NextResponse.json(
          { error: "Please choose a location from the list." },
          { status: 400 },
        );
      }
      const moved = await moveAttendeesToCity(id, targetId);
      await deleteCity(id);
      return NextResponse.json({ ok: true, moved, into: target.name });
    }

    return NextResponse.json({ error: TRY_AGAIN }, { status: 400 });
  } catch {
    return NextResponse.json({ error: TRY_AGAIN }, { status: 500 });
  }
}
