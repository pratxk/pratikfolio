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
    <div className="flex min-h-screen">
      <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r border-white/10 bg-neutral-900/40 backdrop-blur">
        <div className="flex items-center justify-between px-5 py-5">
          <div>
            <div className="text-sm font-semibold tracking-tight text-white">
              Pratikfolio
            </div>
            <div className="text-xs text-cyan-300/70">Content Studio</div>
          </div>
          <button
            onClick={logout}
            className="rounded-md px-2 py-1 text-xs text-white/40 hover:bg-white/10 hover:text-white"
          >
            Log out
          </button>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 pb-4">
          {SECTIONS.map((s) => {
            const href = `/admin/${s.key}`;
            const active = pathname === href;
            return (
              <Link
                key={s.key}
                href={href}
                className={`flex items-center rounded-lg px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-cyan-500/15 font-medium text-cyan-200"
                    : "text-white/55 hover:bg-white/5 hover:text-white"
                }`}
              >
                {s.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-white/10 px-5 py-3">
          <Link
            href="/home"
            className="text-xs text-white/40 hover:text-white"
          >
            ← View live site
          </Link>
        </div>
      </aside>
      <main className="min-w-0 flex-1 overflow-x-hidden px-6 py-8 lg:px-10">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
