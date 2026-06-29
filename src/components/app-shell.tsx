import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { TABLE_LIST } from "@/lib/table-configs";
import { LogOut, LayoutDashboard, Scroll } from "lucide-react";
import type { ReactNode } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="w-64 bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border shadow-elegant">
        <div className="p-6 border-b border-sidebar-border">
          <Link to="/" className="block">
            <div className="font-serif text-2xl font-semibold text-sidebar-primary leading-tight">Madina</div>
            <div className="font-serif text-sm tracking-[0.3em] text-sidebar-foreground/70 uppercase">Leather Shop</div>
            <div className="ornament-divider mt-3"><Scroll className="h-3 w-3" /></div>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          <NavItem to="/dashboard" active={pathname === "/dashboard"} icon={<LayoutDashboard className="h-4 w-4" />}>
            Dashboard
          </NavItem>
          <div className="px-3 pt-4 pb-1 text-[0.65rem] uppercase tracking-[0.25em] text-sidebar-foreground/50 font-serif">
            Ledgers
          </div>
          {TABLE_LIST.map((t) => (
            <NavItem
              key={t.slug}
              to={`/t/${t.slug}`}
              active={pathname === `/t/${t.slug}`}
            >
              {t.title}
            </NavItem>
          ))}
        </nav>

        <div className="p-4 border-t border-sidebar-border text-sm">
          <div className="font-serif text-sidebar-foreground truncate">{user?.email}</div>
          <div className="text-xs uppercase tracking-widest text-sidebar-primary mt-1">{role}</div>
          <button
            onClick={handleSignOut}
            className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 rounded border border-sidebar-border text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-8">{children}</div>
      </main>
    </div>
  );
}

function NavItem({
  to, active, children, icon,
}: { to: string; active: boolean; children: ReactNode; icon?: ReactNode }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-2 px-3 py-2 rounded font-body text-[15px] transition-colors ${
        active
          ? "bg-sidebar-accent text-sidebar-primary font-semibold"
          : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      }`}
    >
      {icon}
      <span>{children}</span>
    </Link>
  );
}
