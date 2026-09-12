import { NextResponse } from "next/server";
import { currentOrganiser } from "@/lib/auth/require-login";
import { writeListToSheet } from "@/lib/sheets/sync";

export const dynamic = "force-dynamic";

const NOT_SET_UP =
  "The Google sheet is not set up yet. Please ask for help to switch it on.";
const TRY_AGAIN = "Could not update the sheet right now. Please try again.";

export async function POST() {
  if (!(await currentOrganiser())) {
    return NextResponse.json({ error: "Please log in again." }, { status: 401 });
  }

  try {
    const result = await writeListToSheet();
    if (result.state === "off") {
      return NextResponse.json({ error: NOT_SET_UP }, { status: 400 });
    }
    return NextResponse.json({ ok: true, people: result.people });
  } catch {
    return NextResponse.json({ error: TRY_AGAIN }, { status: 500 });
  }
}
