import { google } from "googleapis";

export type SyncStatus = "SUCCESS" | "FAILED" | "NOT_CONFIGURED";
export interface SyncResult {
  status: SyncStatus;
  error?: string;
}

interface LeadRow {
  timestamp: string;
  name: string;
  phone: string;
  source: string;
  status: string;
}

const HEADER_ROW = ["Timestamp", "Customer Name", "Mobile Number", "Source", "Lead Status"];

/**
 * Appends one row to the ONE permanent, pre-existing Google Sheet configured
 * via env vars. Never creates a new spreadsheet — only creates the
 * configured worksheet tab (with a header row) the first time, if it's
 * missing from that spreadsheet, then appends below it on every call after.
 */
export async function appendLeadToGoogleSheet(row: LeadRow): Promise<SyncResult> {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  const sheetName = process.env.GOOGLE_SHEET_NAME || "Leads";
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKeyRaw = process.env.GOOGLE_PRIVATE_KEY;

  if (!sheetId || !clientEmail || !privateKeyRaw) {
    return { status: "NOT_CONFIGURED" };
  }

  try {
    const auth = new google.auth.JWT({
      email: clientEmail,
      key: privateKeyRaw.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    const sheets = google.sheets({ version: "v4", auth });

    const meta = await sheets.spreadsheets.get({ spreadsheetId: sheetId });
    const tabExists = meta.data.sheets?.some((s) => s.properties?.title === sheetName);

    if (!tabExists) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: sheetId,
        requestBody: { requests: [{ addSheet: { properties: { title: sheetName } } }] },
      });
      await sheets.spreadsheets.values.append({
        spreadsheetId: sheetId,
        range: `${sheetName}!A1`,
        valueInputOption: "RAW",
        requestBody: { values: [HEADER_ROW] },
      });
    }

    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: `${sheetName}!A:E`,
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: [[row.timestamp, row.name, row.phone, row.source, row.status]],
      },
    });

    return { status: "SUCCESS" };
  } catch (err) {
    return { status: "FAILED", error: err instanceof Error ? err.message : "Unknown Google Sheets error" };
  }
}
