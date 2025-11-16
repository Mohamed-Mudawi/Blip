"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import TopBar from "../components/TopBar";

export default function SettingsPage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const [message, setMessage] = useState("");

    // form state
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");

    const [editUsername, setEditUsername] = useState(false);
    const [editEmail, setEditEmail] = useState(false);
    const [editPassword, setEditPassword] = useState(false);

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // -------------------------------------------
    // ✅ NEW STATE: Is Twitter connected?
    // -------------------------------------------
    const [twitterConnected, setTwitterConnected] = useState(false);

    useEffect(() => {
        async function loadUser() {
            const { data } = await supabase.auth.getUser();
            if (data?.user) {
                setUser(data.user);
                setUsername(data.user.user_metadata?.username ?? "");
                setEmail(data.user.email ?? "");

                // -------------------------------------------
                // ✅ Check Twitter linked token in database
                // -------------------------------------------
                const { data: social } = await supabase
                    .from("social_tokens")
                    .select("*")
                    .eq("user_id", data.user.id)
                    .eq("provider", "twitter")
                    .maybeSingle();

                setTwitterConnected(!!social);
            }
            setLoading(false);
        }
        loadUser();
    }, []);

    // --------------------------------------------------
    // UPDATE USERNAME
    // --------------------------------------------------
    async function updateUsernameHandler() {
        if (!username.trim()) return setMessage("Username cannot be empty.");
        setMessage("");

        const { error } = await supabase.auth.updateUser({
            data: { username },
        });

        if (error) return setMessage(error.message);

        await supabase.from("profiles").update({ username }).eq("id", user.id);

        setMessage("Username updated!");
        setEditUsername(false);
    }

    // --------------------------------------------------
    // UPDATE EMAIL
    // --------------------------------------------------
    async function updateEmailHandler() {
        if (!email.trim()) return setMessage("Email cannot be empty.");
        setMessage("");

        const { error } = await supabase.auth.updateUser({ email });
        if (error) return setMessage(error.message);

        await supabase.from("profiles").update({ email }).eq("id", user.id);

        setMessage("Email updated! Check your inbox.");
        setEditEmail(false);
    }

    // --------------------------------------------------
    // UPDATE PASSWORD
    // --------------------------------------------------
    async function updatePasswordHandler() {
        setMessage("");

        if (!currentPassword) return setMessage("Enter your current password.");
        if (!newPassword || !confirmPassword)
            return setMessage("Enter both new password fields.");
        if (newPassword !== confirmPassword)
            return setMessage("New passwords do not match.");

        const { error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password: currentPassword,
        });

        if (signInError) {
            return setMessage("Current password is incorrect.");
        }

        const { error } = await supabase.auth.updateUser({
            password: newPassword,
        });

        if (error) return setMessage(error.message);

        setMessage("Password updated!");
        setEditPassword(false);

        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
    }

    if (loading)
        return (
            <div className="min-h-screen flex items-center justify-center text-gray-400">
                Loading...
            </div>
        );

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black">
            <TopBar user={user} />

            <div className="max-w-2xl mx-auto p-6">
                <h1 className="text-3xl font-bold mb-6 text-black dark:text-white">
                    Account Settings
                </h1>

                {message && (
                    <p className="mb-4 text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 p-3 rounded">
                        {message}
                    </p>
                )}

                {/* ========================================================= */}
                {/* ✅ SOCIAL ACCOUNTS SECTION (NEW)                         */}
                {/* ========================================================= */}
                <div className="p-6 bg-zinc-900 rounded-xl shadow space-y-4 mb-8">
                    <h2 className="text-xl text-white font-semibold">
                        Social Accounts
                    </h2>

                    {/* Twitter Connection */}
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-zinc-400">Twitter</p>
                            <p className="text-xl text-white">
                                {twitterConnected ? "Connected" : "Not Connected"}
                            </p>
                        </div>

                        {!twitterConnected ? (
                            <a
                                href="/api/auth/twitter"
                                className="bg-blue-600 px-4 py-2 rounded text-white"
                            >
                                Connect Twitter
                            </a>
                        ) : (
                            <button
                                className="bg-red-600 px-4 py-2 rounded text-white"
                                onClick={async () => {
                                    await supabase
                                        .from("social_tokens")
                                        .delete()
                                        .eq("user_id", user.id)
                                        .eq("provider", "twitter");
                                    setTwitterConnected(false);
                                    setMessage("Twitter disconnected.");
                                }}
                            >
                                Disconnect
                            </button>
                        )}
                    </div>
                </div>

                {/* ========================================================= */}
                {/* USERNAME BLOCK */}
                {/* ========================================================= */}
                <div className="p-6 bg-zinc-900 rounded-xl shadow space-y-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm text-zinc-400">Username</p>
                            <p className="text-xl">{username}</p>
                        </div>
                        <button
                            className="bg-blue-600 px-4 py-2 rounded text-white"
                            onClick={() => setEditUsername(!editUsername)}
                        >
                            Edit
                        </button>
                    </div>

                    {editUsername && (
                        <div className="space-y-3">
                            <input
                                className="w-full p-2 rounded bg-zinc-800 border border-zinc-700"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                            <button
                                className="w-full bg-blue-600 py-2 rounded text-white"
                                onClick={updateUsernameHandler}
                            >
                                Save Username
                            </button>
                        </div>
                    )}
                </div>

                {/* ========================================================= */}
                {/* EMAIL BLOCK */}
                {/* ========================================================= */}
                <div className="p-6 bg-zinc-900 rounded-xl shadow mt-6 space-y-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm text-zinc-400">Email</p>
                            <p className="text-xl">{email}</p>
                        </div>
                        <button
                            className="bg-blue-600 px-4 py-2 rounded text-white"
                            onClick={() => setEditEmail(!editEmail)}
                        >
                            Edit
                        </button>
                    </div>

                    {editEmail && (
                        <div className="space-y-3">
                            <input
                                type="email"
                                className="w-full p-2 rounded bg-zinc-800 border border-zinc-700"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <button
                                className="w-full bg-blue-600 py-2 rounded text-white"
                                onClick={updateEmailHandler}
                            >
                                Save Email
                            </button>
                        </div>
                    )}
                </div>

                {/* ========================================================= */}
                {/* PASSWORD BLOCK */}
                {/* ========================================================= */}
                <div className="p-6 bg-zinc-900 rounded-xl shadow mt-6 space-y-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm text-zinc-400">Password</p>
                            <p className="text-xl">********</p>
                        </div>
                        <button
                            className="bg-blue-600 px-4 py-2 rounded text-white"
                            onClick={() => setEditPassword(!editPassword)}
                        >
                            Change
                        </button>
                    </div>

                    {editPassword && (
                        <div className="space-y-3">
                            <input
                                type="password"
                                placeholder="Current password"
                                className="w-full p-2 rounded bg-zinc-800 border border-zinc-700"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                            />
                            <input
                                type="password"
                                placeholder="New password"
                                className="w-full p-2 rounded bg-zinc-800 border border-zinc-700"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                            <input
                                type="password"
                                placeholder="Confirm new password"
                                className="w-full p-2 rounded bg-zinc-800 border border-zinc-700"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />

                            <button
                                className="w-full bg-blue-600 py-2 rounded text-white"
                                onClick={updatePasswordHandler}
                            >
                                Save New Password
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
