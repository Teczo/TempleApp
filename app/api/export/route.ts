import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { currentOrganiser } from "@/lib/auth/require-login";
import { listAllActiveAttendees } from "@/lib/db/attendee-list";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await currentOrganiser())) {
    return NextResponse.json({ error: "Please log in again." }, { status: 401 });
  }

  try {
    const people = await listAllActiveAttendees();

    const rows = people.map((person) => ({
      Name: person.name,
      "Phone number": person.phone,
      City: person.cityName,
      Region: person.region,
      Country: person.country,
      Joined: person.joined ? person.joined.toISOString().slice(0, 10) : "",
    }));

    const sheet = XLSX.utils.json_to_sheet(rows, {
      header: ["Name", "Phone number", "City", "Region", "Country", "Joined"],
    });
    sheet["!cols"] = [{ wch: 28 }, { wch: 18 }, { wch: 16 }, { wch: 14 }, { wch: 14 }, { wch: 12 }];

    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet, "Attendees");
    const file = XLSX.write(book, { type: "buffer", bookType: "xlsx" }) as Buffer;

    const today = new Date().toISOString().slice(0, 10);
    return new NextResponse(new Uint8Array(file), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="attendees-${today}.xlsx"`,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Could not make the file right now. Please try again." },
      { status: 500 },
    );
  }
}
