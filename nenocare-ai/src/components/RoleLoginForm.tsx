"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

type Props = {
  role: "ADMIN" | "DOCTOR" | "PATIENT";
  callbackUrl: string;
};

export default function RoleLoginForm({ role, callbackUrl }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "").trim();

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
      expectedRole: role,
      callbackUrl,
    });

    if (result?.error) {
      setError("Invalid credentials or unauthorized role.");
      setLoading(false);
      return;
    }

    window.location.href = callbackUrl;
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
      <input name="email" type="email" placeholder="Email" required />
      <input name="password" type="password" placeholder="Password" required />
      {error ? <p style={{ color: "crimson" }}>{error}</p> : null}
      <button type="submit" disabled={loading}>
        {loading ? "Signing in..." : `Sign in as ${role}`}
      </button>
    </form>
  );
}
