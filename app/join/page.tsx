import type { Metadata } from "next";
import JoinForm from "@/components/JoinForm";

export const metadata: Metadata = {
  title: "Join the Thiruppugazh Class",
};

export default function JoinPage() {
  return (
    <main className="mx-auto max-w-md px-5 py-8">
      <h1 className="text-2xl font-semibold">Join the Thiruppugazh Class</h1>
      <p className="mt-2 mb-6 text-base text-stone-600">
        Please fill in your details below.
      </p>
      <JoinForm />
    </main>
  );
}
