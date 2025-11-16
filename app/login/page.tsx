"use client";
import { supabase } from "@/lib/supabase";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const message = searchParams.get("message");

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }

      if (!data.user) {
        setError("Login failed");
        setLoading(false);
        return;
      }

      router.push("/home");
    } catch (err) {
      setError("Unexpected login error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-50 dark:bg-black px-4">
      <form
        onSubmit={handleLogin}
        className="p-8 bg-white dark:bg-zinc-900 rounded-xl shadow-lg w-full max-w-sm flex flex-col gap-4"
      >
        <h1 className="text-2xl font-semibold text-black dark:text-white">Log In</h1>

        {message && (
          <p className="text-green-600 dark:text-green-400 text-sm bg-green-50 dark:bg-green-900/20 p-2 rounded">
            {message}
          </p>
        )}

        <input
          name="email"
          placeholder="Email"
          type="email"
          className="border border-zinc-300 dark:border-zinc-700 px-4 py-2 rounded-md bg-white dark:bg-zinc-800 text-black dark:text-white"
        />
        <input
          name="password"
          placeholder="Password"
          type="password"
          className="border border-zinc-300 dark:border-zinc-700 px-4 py-2 rounded-md bg-white dark:bg-zinc-800 text-black dark:text-white"
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-md transition"
        >
          {loading ? "Logging in..." : "Log In"}
        </button>

        <a href="/signup" className="text-blue-600 dark:text-blue-400 underline text-sm text-center">
          Create an account →
        </a>
      </form>
    </div>
  );
}