"use client";

import { supabase } from "@/lib/supabase";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const username = formData.get("username") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!username || !email || !password) {
      setError("All fields are required");
      setLoading(false);
      return;
    }

    try {
      // 1. Create user — Supabase auto-logs them in (if email confirmation is disabled)
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username },
        },
      });

      if (signUpError) {
        console.error("Sign up error:", signUpError);

        if (signUpError.message.includes("already registered")) {
          setError("This email is already registered. Try logging in instead.");
        } else {
          setError(signUpError.message);
        }

        setLoading(false);
        return;
      }

      if (!data.user) {
        setError("Signup failed — no user returned");
        setLoading(false);
        return;
      }

      // 2. Create profile row in your database
      const { error: profileError } = await supabase.from("profiles").insert({
        id: data.user.id,
        username,
        email,
      });

      if (profileError) {
        console.error("Profile creation error:", profileError);
        setError(
          "Account created, but there was an issue saving your profile."
        );
        // Continue anyway
      }

      // 3. Supabase already logged them in → redirect
      router.push("/home");

    } catch (err) {
      console.error("Signup error:", err);
      setError("An unexpected error occurred during signup");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-50 dark:bg-black px-4">
      <form
        onSubmit={handleSignup}
        className="p-8 bg-white dark:bg-zinc-900 rounded-xl shadow-lg w-full max-w-sm flex flex-col gap-4"
      >
        <h1 className="text-2xl font-semibold text-black dark:text-white">
          Create Account
        </h1>

        <input
          name="username"
          placeholder="Username"
          className="border border-zinc-300 dark:border-zinc-700 px-4 py-2 rounded-md bg-white dark:bg-zinc-800 text-black dark:text-white"
          disabled={loading}
        />
        <input
          name="email"
          placeholder="Email"
          type="email"
          className="border border-zinc-300 dark:border-zinc-700 px-4 py-2 rounded-md bg-white dark:bg-zinc-800 text-black dark:text-white"
          disabled={loading}
        />
        <input
          name="password"
          placeholder="Password"
          type="password"
          minLength={6}
          className="border border-zinc-300 dark:border-zinc-700 px-4 py-2 rounded-md bg-white dark:bg-zinc-800 text-black dark:text-white"
          disabled={loading}
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-md transition"
        >
          {loading ? "Creating Account..." : "Sign Up"}
        </button>

        <a
          href="/login"
          className="text-blue-600 dark:text-blue-400 underline text-sm text-center"
        >
          Already have an account? Log in →
        </a>
      </form>
    </div>
  );
}
