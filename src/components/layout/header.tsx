"use client";

import { usePathname } from "next/navigation";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/contacts": "Contacts",
  "/segments": "Segments",
  "/campaigns": "Campaigns",
  "/campaigns/new": "New Campaign",
};

export function Header() {
  const pathname = usePathname();
  const title = pageTitles[pathname] ?? "Campaign Manager";

  return (
    <header className="flex h-14 items-center border-b border-border bg-card px-6">
      <h1 className="text-lg font-semibold">{title}</h1>
    </header>
  );
}
