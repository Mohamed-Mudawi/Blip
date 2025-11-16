"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function UserMenu({ user }: { user: any }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="px-4 py-2 bg-zinc-200 text-zinc-800 rounded-lg hover:bg-zinc-300 outline outline-1 outline-blue-300"
      >
        {user?.user_metadata?.username || user?.email}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white text-zinc-800 shadow-lg rounded-lg border border-blue-200">
          <button
            onClick={() => {
              setOpen(false);
              router.push("/settings");
            }}
            className="w-full text-left px-4 py-2 hover:bg-zinc-100"
          >
            Account Settings
          </button>

          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 hover:bg-zinc-100 text-red-600"
          >
            Log Out
          </button>
        </div>
      )}
    </div>
  );
}
