import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-md px-5 py-10">
      <h1 className="text-2xl font-semibold">Nothing here</h1>
      <p className="mt-2 text-base text-stone-600">
        We could not find that page. It may have been taken away.
      </p>
      <Link href="/dashboard" className="mt-6 inline-block text-base underline">
        Go to the attendee list
      </Link>
    </main>
  );
}
