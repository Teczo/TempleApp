import { auth, sheets, type sheets_v4 } from "@googleapis/sheets";

const SCOPE = "https://www.googleapis.com/auth/spreadsheets";
const DEFAULT_TAB = "Attendees";

export interface SheetSettings {
  spreadsheetId: string;
  clientEmail: string;
  privateKey: string;
  tabName: string;
}

/**
 * The Google settings, or null when they are not filled in. Null means the
 * live sheet is simply switched off: everything else in the app still works.
 */
export function sheetSettings(): SheetSettings | null {
  const spreadsheetId = (process.env.GOOGLE_SHEET_ID ?? "").trim();
  const clientEmail = (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ?? "").trim();

  // Hosting panels keep the key on one line, so the line breaks arrive as
  // the two characters \ and n. Google needs them as real line breaks.
  const privateKey = (process.env.GOOGLE_SERVICE_ACCOUNT_KEY ?? "")
    .replace(/\\n/g, "\n")
    .trim();

  if (!spreadsheetId || !clientEmail || !privateKey) return null;

  return {
    spreadsheetId,
    clientEmail,
    privateKey,
    tabName: (process.env.GOOGLE_SHEET_TAB ?? "").trim() || DEFAULT_TAB,
  };
}

export function isSheetSyncOn(): boolean {
  return sheetSettings() !== null;
}

export function sheetsClient(settings: SheetSettings): sheets_v4.Sheets {
  const login = new auth.JWT({
    email: settings.clientEmail,
    key: settings.privateKey,
    scopes: [SCOPE],
  });
  return sheets({ version: "v4", auth: login });
}

/** The web address of the sheet, for the organiser to tap. */
export function sheetLink(settings: SheetSettings): string {
  return `https://docs.google.com/spreadsheets/d/${settings.spreadsheetId}/edit`;
}
