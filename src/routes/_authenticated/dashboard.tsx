import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TABLE_LIST } from "@/lib/table-configs";
import { Package, Users, Truck, Hammer, ShoppingCart, Wallet } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Madina Leather Shop" }] }),
  component: Dashboard,
});

const STATS = [
  { table: "customers", label: "Customers", icon: Users },
  { table: "products", label: "Products", icon: Package },
  { table: "orders", label: "Orders", icon: ShoppingCart },
  { table: "suppliers", label: "Suppliers", icon: Truck },
  { table: "employees", label: "Employees", icon: Hammer },
  { table: "payments", label: "Payments", icon: Wallet },
];

function Dashboard() {
  const { user, role } = useAuth();

  const { data: counts } = useQuery({
    queryKey: ["dashboard-counts"],
    queryFn: async () => {
      const entries = await Promise.all(
        STATS.map(async (s) => {
          const { count } = await supabase
            .from(s.table as never)
            .select("*", { count: "exact", head: true });
          return [s.table, count ?? 0] as const;
        }),
      );
      return Object.fromEntries(entries) as Record<string, number>;
    },
  });

  const { data: salesTotal } = useQuery({
    queryKey: ["sales-total"],
    queryFn: async () => {
      const { data } = await supabase.from("orders").select("total_amount");
      return (data ?? []).reduce((s, r) => s + Number(r.total_amount ?? 0), 0);
    },
  });

  return (
    <AppShell>
      <header className="mb-10">
        <p className="font-serif italic text-muted-foreground">Good day,</p>
        <h1 className="font-serif text-4xl text-primary">{user?.email?.split("@")[0]}</h1>
        <div className="ornament-divider mt-4 text-accent max-w-md">
          <span className="font-serif text-xs uppercase tracking-[0.3em]">{role === "admin" ? "Shop Administrator" : "Staff Member"}</span>
        </div>
      </header>

      <section className="grid grid-cols-2 md:grid-cols-3 gap-5 mb-12">
        {STATS.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.table} className="bg-card border border-border rounded-lg p-5 shadow-elegant">
              <div className="flex items-center justify-between mb-3">
                <span className="font-serif uppercase tracking-widest text-xs text-muted-foreground">{s.label}</span>
                <Icon className="h-5 w-5 text-accent" />
              </div>
              <div className="font-serif text-3xl text-primary">{counts?.[s.table] ?? "—"}</div>
            </div>
          );
        })}
      </section>

      <section className="bg-gradient-gold rounded-lg p-8 mb-12 shadow-elegant text-primary-foreground">
        <div className="text-xs uppercase tracking-[0.3em] font-serif text-primary/70">Total Sales Ledger</div>
        <div className="font-serif text-5xl text-primary mt-2">
          Rs {salesTotal?.toLocaleString() ?? "—"}
        </div>
        <p className="italic text-primary/80 mt-2">Sum of all recorded orders</p>
      </section>

      <section>
        <h2 className="font-serif text-2xl text-primary mb-4">Ledgers</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {TABLE_LIST.map((t) => (
            <Link
              key={t.slug}
              to={`/t/${t.slug}`}
              className="block bg-card border border-border rounded p-4 hover:border-accent hover:shadow-elegant transition"
            >
              <div className="font-serif text-lg text-primary">{t.title}</div>
              <div className="text-xs text-muted-foreground italic">Manage {t.title.toLowerCase()}</div>
            </Link>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
