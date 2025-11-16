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
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md"
      >
        {user?.user_metadata?.username || user?.email}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-black/95 text-white shadow-lg rounded-lg border border-blue-600/40 backdrop-blur-sm">
          <button
            onClick={() => {
              setOpen(false);
              router.push("/settings");
            }}
            className="w-full text-left px-4 py-2 hover:bg-blue-600/20 transition-colors"
          >
            Account Settings
          </button>

          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 hover:bg-red-600/20 transition-colors text-red-300"
          >
            Log Out
          </button>
        </div>
      )}
    </div>
  );
}
