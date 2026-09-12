import type { sheets_v4 } from "@googleapis/sheets";
import { listAllActiveAttendees } from "../db/attendee-list.ts";
import { sheetSettings, sheetsClient, type SheetSettings } from "./client.ts";

const HEADER = ["No.", "Name", "Phone number", "City", "Region", "Country", "Joined"];
const LAST_COLUMN = "G";

/** How long a join is allowed to wait for Google before we give up on it. */
const QUICK_WAIT_MS = 5000;

export type SyncResult = { state: "off" } | { state: "done"; people: number };

/**
 * Writes the whole list into the sheet, replacing what is there. A full
 * rewrite keeps edits, removals and merged locations correct, and it repairs
 * itself: any later change writes the complete list again.
 */
export async function writeListToSheet(): Promise<SyncResult> {
  const settings = sheetSettings();
  if (!settings) return { state: "off" };

  const people = await listAllActiveAttendees();
  // The number in the first column is worked out here, not by a sheet
  // formula. The whole list is written again on every change, so the numbers
  // are always right, and plain text keeps the "+" on each phone number safe.
  const rows = people.map((person, index) => [
    index + 1,
    person.name,
    person.phone,
    person.cityName,
    person.region,
    person.country,
    person.joined ? person.joined.toISOString().slice(0, 10) : "",
  ]);

  const api = sheetsClient(settings);
  await makeSureTabExists(api, settings);

  const tab = quoteTab(settings.tabName);
  await api.spreadsheets.values.update({
    spreadsheetId: settings.spreadsheetId,
    range: `${tab}!A1`,
    // RAW keeps a phone number such as +61432807888 as plain text.
    valueInputOption: "RAW",
    requestBody: { values: [HEADER, ...rows] },
  });

  // Wipe anything left over from when the list was longer.
  await api.spreadsheets.values.clear({
    spreadsheetId: settings.spreadsheetId,
    range: `${tab}!A${rows.length + 2}:${LAST_COLUMN}`,
  });

  return { state: "done", people: rows.length };
}

/**
 * For use right after somebody joins or a record changes. It never throws and
 * never holds the person up for long. If Google is slow or down, the next
 * change writes the whole list again.
 */
export async function updateSheetQuietly(): Promise<void> {
  // The catch goes on the write itself, so a late failure after the wait is
  // over cannot come back and break the app.
  const write = writeListToSheet().catch(() => undefined);
  await Promise.race([
    write,
    new Promise((resolve) => setTimeout(resolve, QUICK_WAIT_MS)),
  ]);
}

async function makeSureTabExists(
  api: sheets_v4.Sheets,
  settings: SheetSettings,
): Promise<void> {
  const file = await api.spreadsheets.get({
    spreadsheetId: settings.spreadsheetId,
    fields: "sheets.properties.title",
  });

  const titles = (file.data.sheets ?? []).map((tab) => tab.properties?.title);
  if (titles.includes(settings.tabName)) return;

  await api.spreadsheets.batchUpdate({
    spreadsheetId: settings.spreadsheetId,
    requestBody: {
      requests: [{ addSheet: { properties: { title: settings.tabName } } }],
    },
  });
}

/** A tab name with a space in it has to be wrapped in single quotes. */
function quoteTab(name: string): string {
  return `'${name.replace(/'/g, "''")}'`;
}
