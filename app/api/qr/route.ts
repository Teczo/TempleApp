import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { currentOrganiser } from "@/lib/auth/require-login";
import { joinLinkFor } from "@/lib/utils/base-url";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!(await currentOrganiser())) {
    return NextResponse.json({ error: "Please log in again." }, { status: 401 });
  }

  const wantsDownload = new URL(request.url).searchParams.get("download") === "1";

  try {
    const png = await QRCode.toBuffer(await joinLinkFor(request), {
      width: 600,
      margin: 2,
    });

    const headers: Record<string, string> = {
      "Content-Type": "image/png",
      "Cache-Control": "no-store",
    };
    if (wantsDownload) {
      headers["Content-Disposition"] = 'attachment; filename="join-the-class.png"';
    }

    return new NextResponse(new Uint8Array(png), { headers });
  } catch {
    return NextResponse.json(
      { error: "Could not make the picture right now. Please try again." },
      { status: 500 },
    );
  }
}
