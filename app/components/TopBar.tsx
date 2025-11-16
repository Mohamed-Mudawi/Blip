"use client";

import type { User } from "@supabase/supabase-js";
import UserMenu from "./UserMenu";

export default function TopBar({ user }: { user: User | null }) {
    return (
        <nav className="w-full h-16 bg-gradient-to-r from-black to-slate-900 border-b border-blue-600/30 flex items-center justify-between px-6 shadow-lg">
            {/* Left side: App Name */}
            <h1 className="text-2xl font-bold tracking-tight text-white">
                ✨ Blip
            </h1>

            {/* Right side: User menu */}
            {user && <UserMenu user={user} />}
        </nav>
    );
}
