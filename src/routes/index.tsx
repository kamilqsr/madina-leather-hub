import { createFileRoute, Link } from "@tanstack/react-router";
import { Scroll, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Madina Leather Shop — Heritage Management Ledger" },
      { name: "description", content: "A classical ledger system for managing customers, inventory, orders, and craftsmanship at Madina Leather Shop." },
      { property: "og:title", content: "Madina Leather Shop" },
      { property: "og:description", content: "A classical ledger system for managing customers, inventory, orders, and craftsmanship." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-8 py-6 flex items-center justify-between">
        <div>
          <div className="font-serif text-2xl font-semibold text-primary">Madina</div>
          <div className="font-serif text-[0.65rem] tracking-[0.4em] uppercase text-muted-foreground">Leather Shop</div>
        </div>
        <Link
          to="/auth"
          className="font-serif text-primary border border-primary/40 px-5 py-2 rounded hover:bg-primary hover:text-primary-foreground transition"
        >
          Sign In
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-2xl text-center">
          <div className="ornament-divider mb-6 text-accent">
            <Scroll className="h-4 w-4" />
          </div>
          <p className="font-serif italic text-xl text-muted-foreground mb-3">Est. ledger of craftsmanship</p>
          <h1 className="font-serif text-6xl md:text-7xl text-primary leading-[1.05] mb-6">
            Madina Leather Shop
          </h1>
          <p className="font-body text-xl text-foreground/80 max-w-xl mx-auto mb-10 italic">
            A classical management system for the artisans of fine leather —
            keeping customers, craftsmen, and ledgers in elegant order.
          </p>

          <Link
            to="/auth"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded font-serif text-lg shadow-elegant hover:bg-primary/90 transition"
          >
            Enter the Ledger <ArrowRight className="h-4 w-4" />
          </Link>

          <div className="ornament-divider mt-12 text-accent" />

          <div className="grid grid-cols-3 gap-6 mt-10">
            {[
              { n: "10", l: "Ledgers" },
              { n: "∞", l: "Records" },
              { n: "1", l: "Shop" },
            ].map((s) => (
              <div key={s.l}>
                <div className="font-serif text-4xl text-accent">{s.n}</div>
                <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground font-serif mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="text-center text-xs text-muted-foreground font-serif italic py-6">
        Madina Leather Shop · {new Date().getFullYear()}
      </footer>
    </div>
  );
}
