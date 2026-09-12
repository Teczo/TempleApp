"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const FIELD_CLASS =
  "mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-3 text-base outline-none focus:border-amber-700";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result?.error ?? "Email or password is not correct.");
        return;
      }
      router.replace("/dashboard");
      router.refresh();
    } catch {
      setError("Could not log in. Please check your internet and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="text-sm font-medium text-stone-700">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="username"
          className={FIELD_CLASS}
        />
      </div>

      <div>
        <label htmlFor="password" className="text-sm font-medium text-stone-700">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          className={FIELD_CLASS}
        />
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-base text-red-700">{error}</p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-lg bg-amber-700 px-4 py-4 text-lg font-semibold text-white disabled:opacity-60"
      >
        {busy ? "Please wait…" : "Log in"}
      </button>
    </form>
  );
}
