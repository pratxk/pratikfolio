/** Portfolio Admin CMS — Copyright (C) 2026 Pratik Singh (AGPL-3.0). */
"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { SECTIONS } from "@/components/admin/section-descriptors.js";

export default function AdminShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="mx-auto flex max-w-6xl gap-6 p-6">
      <aside className="w-56 shrink-0">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm font-semibold text-white/90">Admin</span>
          <button
            onClick={logout}
            className="text-xs text-white/50 hover:text-white"
          >
            Log out
          </button>
        </div>
        <nav className="flex flex-col gap-1">
          {SECTIONS.map((s) => {
            const href = `/admin/${s.key}`;
            const active = pathname === href;
            return (
              <Link
                key={s.key}
                href={href}
                className={`rounded-md px-3 py-2 text-sm ${
                  active
                    ? "bg-white/15 text-white"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                {s.label}
              </Link>
            );
          })}
        </nav>
        <Link
          href="/home"
          className="mt-4 inline-block text-xs text-white/40 hover:text-white"
        >
          ← View site
        </Link>
      </aside>
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
