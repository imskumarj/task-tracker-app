import { Link, useNavigate } from "@tanstack/react-router";
import { ClipboardCheck, LogOut } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";

interface NavItem { label: string; to: string }

export function AppShell({
  title,
  subtitle,
  nav,
  children,
}: {
  title: string;
  subtitle?: string;
  nav?: NavItem[];
  children: ReactNode;
}) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  const initials = (profile?.full_name ?? "U")
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border bg-surface/80 backdrop-blur supports-[backdrop-filter]:bg-surface/60 sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between gap-6">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shadow-soft">
              <ClipboardCheck className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <div className="font-display font-bold text-base text-foreground">TaskBoard</div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                {profile?.role ?? ""}
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end leading-tight">
              <span className="text-sm font-medium text-foreground">{profile?.full_name}</span>
              <span className="text-xs text-muted-foreground">{profile?.email}</span>
            </div>
            <div className="h-10 w-10 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-semibold">
              {initials}
            </div>
            <Button variant="outline" size="sm" onClick={handleSignOut} className="gap-1.5">
              <LogOut className="h-4 w-4" /> Sign out
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-7xl px-6 pt-8 pb-12 flex-1">
        <div className="mb-6">
          <h1 className="text-3xl font-display font-bold text-foreground">{title}</h1>
          {subtitle && <p className="mt-1 text-muted-foreground">{subtitle}</p>}
        </div>

        {nav && nav.length > 0 && (
          <nav className="mb-6 flex flex-wrap gap-1.5 border-b border-border pb-0">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="px-4 py-2.5 text-sm font-medium text-muted-foreground rounded-t-md hover:text-foreground hover:bg-accent/50 [&.active]:text-primary [&.active]:bg-accent [&.active]:border-b-2 [&.active]:border-primary -mb-px transition-colors"
                activeProps={{ className: "active" }}
              >
                {n.label}
              </Link>
            ))}
          </nav>
        )}

        {children}
      </div>
    </div>
  );
}
