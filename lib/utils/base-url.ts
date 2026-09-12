import { headers } from "next/headers";

/**
 * The web address of the app. Uses the setting when it is filled in, and
 * otherwise works it out from the address the browser asked for. This means
 * the join link is right even before the setting is added on Vercel.
 */
export async function baseUrl(): Promise<string> {
  const configured = process.env.NEXT_PUBLIC_BASE_URL?.trim();
  if (configured) return configured.replace(/\/+$/, "");

  const store = await headers();
  const host = store.get("x-forwarded-host") ?? store.get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  return `${protocol}://${host}`;
}

export async function joinLink(): Promise<string> {
  return `${await baseUrl()}/join`;
}

/** The same link, worked out from one request. */
export async function joinLinkFor(request: Request): Promise<string> {
  const configured = process.env.NEXT_PUBLIC_BASE_URL?.trim();
  if (configured) return `${configured.replace(/\/+$/, "")}/join`;
  return new URL("/join", request.url).toString();
}
