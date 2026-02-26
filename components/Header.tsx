"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { db } from "@/lib/db";

export function Header() {
  const pathname = usePathname();
  const { isLoading, user } = db.useAuth();

  return (
    <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-surface px-5 py-3">
      <Link href="/" className="text-xl font-bold text-accent">
        Meme Generator
      </Link>
      <nav className="flex items-center gap-4">
        <Link
          href="/create"
          className={`text-sm font-medium transition-colors ${
            pathname === "/create"
              ? "text-accent"
              : "text-muted hover:text-[#e0e0e0]"
          }`}
        >
          Create
        </Link>
        <Link
          href="/community"
          className={`text-sm font-medium transition-colors ${
            pathname === "/community"
              ? "text-accent"
              : "text-muted hover:text-[#e0e0e0]"
          }`}
        >
          Community
        </Link>
      </nav>
      <div className="ml-auto flex items-center gap-2">
        {isLoading ? (
          <span className="text-xs text-muted">...</span>
        ) : user ? (
          <button
            onClick={() => db.auth.signOut()}
            className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:border-accent hover:text-accent"
          >
            Sign out
          </button>
        ) : (
          <span className="text-xs text-muted">Not signed in</span>
        )}
      </div>
    </header>
  );
}
