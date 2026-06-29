import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) throw redirect({ to: "/dashboard" });
  },
  head: () => ({
    meta: [
      { title: "Sign in — Madina Leather Shop" },
      { name: "description", content: "Sign in to manage Madina Leather Shop's inventory, customers, and orders." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) navigate({ to: "/dashboard", replace: true });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
        toast.success("Account created. Welcome to Madina!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <div className="font-serif text-4xl font-semibold text-primary">Madina</div>
            <div className="font-serif text-sm tracking-[0.4em] uppercase text-muted-foreground mt-1">Leather Shop</div>
          </Link>
          <div className="ornament-divider mt-6 text-accent">
            <span className="font-serif italic text-sm">est. ledger</span>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg shadow-elegant p-8">
          <h1 className="font-serif text-2xl text-center text-card-foreground mb-1">
            {mode === "signin" ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="text-center text-sm text-muted-foreground italic mb-6">
            {mode === "signin" ? "Sign in to continue" : "Open a new ledger"}
          </p>

          <form onSubmit={submit} className="space-y-4">
            {mode === "signup" && (
              <Field label="Full Name">
                <input
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input-classical"
                />
              </Field>
            )}
            <Field label="Email">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-classical"
              />
            </Field>
            <Field label="Password">
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-classical"
              />
            </Field>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground font-serif text-lg py-2.5 rounded hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              {loading ? "Please wait…" : mode === "signin" ? "Sign In" : "Create Account"}
            </button>
          </form>

          <div className="ornament-divider my-6 text-border" />

          <button
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="w-full text-center text-sm text-muted-foreground hover:text-primary italic"
          >
            {mode === "signin" ? "No account? Create one" : "Already registered? Sign in"}
          </button>
        </div>

        <p className="text-xs text-center text-muted-foreground mt-6 italic">
          The first user to sign up becomes the shop administrator.
        </p>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block font-serif text-sm text-foreground mb-1">{label}</span>
      {children}
    </label>
  );
}
