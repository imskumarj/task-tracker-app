"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ClipboardCheck, LogOut } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";

interface NavItem {
  label: string;
  href: string;
}

interface UserInfo {
  full_name?: string;
  email?: string;
  role?: string;
}

interface AppShellProps {
  title: string;
  subtitle?: string;
  nav?: NavItem[];
  user?: UserInfo;
  children: ReactNode;
}

export default function AppShell({
  title,
  subtitle,
  nav,
  user,
  children,
}: AppShellProps) {
  const router = useRouter();

  const initials = (user?.full_name ?? "U")
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleSignOut = () => {
    localStorage.removeItem("token");

    router.push("/");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <ClipboardCheck className="h-5 w-5" />
            </div>

            <div className="leading-tight">
              <div className="font-bold text-base">
                TaskBoard
              </div>

              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                {user?.role ?? ""}
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end leading-tight">
              <span className="text-sm font-medium">
                {user?.full_name}
              </span>

              <span className="text-xs text-muted-foreground">
                {user?.email}
              </span>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent font-semibold">
              {initials}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="gap-1.5"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-7xl flex-1 px-6 pt-8 pb-12">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">
            {title}
          </h1>

          {subtitle && (
            <p className="mt-1 text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>

        {nav && nav.length > 0 && (
          <nav className="mb-6 flex flex-wrap gap-1.5 border-b border-border">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-t-md px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}

        {children}
      </div>
    </div>
  );
}