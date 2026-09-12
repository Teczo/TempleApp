import type { Metadata } from "next";
import LoginForm from "@/components/LoginForm";

export const metadata: Metadata = {
  title: "Log in",
};

export default function LoginPage() {
  return (
    <main className="mx-auto max-w-md px-5 py-10">
      <h1 className="mb-6 text-2xl font-semibold">Log in</h1>
      <LoginForm />
    </main>
  );
}
