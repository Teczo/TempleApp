import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-10">
      <h1 className="text-2xl font-semibold">Thiruppugazh Class</h1>
      <p className="mt-2 text-base text-stone-600">
        Welcome. Use the link below to join the class.
      </p>
      <Link
        href="/join"
        className="mt-6 rounded-lg bg-amber-700 px-4 py-4 text-center text-lg font-semibold text-white"
      >
        Join the class
      </Link>
    </main>
  );
}
