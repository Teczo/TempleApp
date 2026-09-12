import type { Metadata } from "next";
import Link from "next/link";
import CopyButton from "@/components/CopyButton";
import DownloadButton from "@/components/DownloadButton";
import LogoutButton from "@/components/LogoutButton";
import { joinLink } from "@/lib/utils/base-url";

export const metadata: Metadata = { title: "Settings" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const link = await joinLink();

  return (
    <main className="mx-auto max-w-md px-5 py-8">
      <Link href="/dashboard" className="text-sm text-stone-600 underline">
        Back to all cities
      </Link>

      <h1 className="mt-3 text-2xl font-semibold">Settings</h1>

      <section className="mt-6 rounded-lg bg-white px-4 py-4 shadow-sm">
        <h2 className="text-base font-semibold">The link to share</h2>
        <p className="mt-1 text-sm text-stone-600">
          Send this to anyone who wants to join the class.
        </p>
        <p className="mt-3 break-all rounded-lg bg-stone-100 px-3 py-3 text-sm">
          {link}
        </p>
        <CopyButton text={link} label="Copy link" className="mt-3" />
      </section>

      <section className="mt-4 rounded-lg bg-white px-4 py-4 shadow-sm">
        <h2 className="text-base font-semibold">Picture code</h2>
        <p className="mt-1 text-sm text-stone-600">
          People can point their phone camera at this to open the link.
        </p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/api/qr"
          alt="Picture code for the join link"
          width={600}
          height={600}
          className="mx-auto mt-3 h-56 w-56 rounded-lg border border-stone-200 bg-white"
        />
        <DownloadButton
          href="/api/qr?download=1"
          label="Download the picture"
          className="mt-3 block w-full rounded-lg border border-stone-300 bg-white px-4 py-3 text-center text-base font-medium"
        />
      </section>

      <section className="mt-4 rounded-lg bg-white px-4 py-4 shadow-sm">
        <h2 className="text-base font-semibold">The whole list</h2>
        <p className="mt-1 text-sm text-stone-600">
          Everyone on the list, in a file you can open in Excel.
        </p>
        <DownloadButton
          href="/api/export"
          label="Download attendee list"
          className="mt-3 block w-full rounded-lg bg-amber-700 px-4 py-3 text-center text-base font-semibold text-white"
        />
      </section>

      <div className="mt-6 text-center">
        <LogoutButton />
      </div>
    </main>
  );
}
