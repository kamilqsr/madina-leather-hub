import { createFileRoute, notFound, useParams } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TABLES, type FieldConfig, type TableConfig } from "@/lib/table-configs";
import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated/t/$table")({
  head: ({ params }) => {
    const t = TABLES[params.table];
    return { meta: [{ title: `${t?.title ?? "Ledger"} — Madina Leather Shop` }] };
  },
  component: TablePage,
});

type Row = Record<string, unknown>;

function TablePage() {
  const { table } = useParams({ from: "/_authenticated/t/$table" });
  const config = TABLES[table];
  if (!config) throw notFound();
  return <TableView key={config.slug} config={config} />;
}

function TableView({ config }: { config: TableConfig }) {
  const qc = useQueryClient();
  useAuth();
  const isAdmin = true;
  const [editing, setEditing] = useState<Row | null>(null);
  const [creating, setCreating] = useState(false);

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["table", config.name],
    queryFn: async () => {
      const sort = config.defaultSort ?? { column: config.pk, ascending: false };
      const { data, error } = await supabase
        .from(config.name as never)
        .select("*")
        .order(sort.column, { ascending: sort.ascending });
      if (error) throw error;
      return (data ?? []) as Row[];
    },
  });

  // Pre-fetch reference tables for selects/labels
  const refTables = Array.from(
    new Set(config.fields.filter((f) => f.ref).map((f) => f.ref!.table)),
  );
  const { data: refs = {} } = useQuery({
    queryKey: ["refs", refTables.join(",")],
    enabled: refTables.length > 0,
    queryFn: async () => {
      const out: Record<string, Row[]> = {};
      await Promise.all(
        refTables.map(async (t) => {
          const { data } = await supabase.from(t as never).select("*");
          out[t] = (data ?? []) as Row[];
        }),
      );
      return out;
    },
  });

  const deleteRow = useMutation({
    mutationFn: async (id: unknown) => {
      const { error } = await supabase.from(config.name as never).delete().eq(config.pk, id as never);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["table", config.name] });
      qc.invalidateQueries({ queryKey: ["dashboard-counts"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const displayValue = (field: FieldConfig, value: unknown) => {
    if (value === null || value === undefined || value === "") return <span className="text-muted-foreground/60">—</span>;
    if (field.ref) {
      const list = refs[field.ref.table] ?? [];
      const match = list.find((r) => r[field.ref!.valueKey] === value);
      if (match) return String(match[field.ref.labelKey] ?? value);
    }
    if (field.type === "number" && (field.key.includes("price") || field.key.includes("amount") || field.key.includes("cost") || field.key.includes("salary"))) {
      return `Rs ${Number(value).toLocaleString()}`;
    }
    return String(value);
  };

  return (
    <AppShell>
      <header className="flex items-end justify-between mb-6">
        <div>
          <p className="font-serif italic text-muted-foreground">Madina Ledger</p>
          <h1 className="font-serif text-4xl text-primary">{config.title}</h1>
        </div>
        {isAdmin && (
          <button
            onClick={() => setCreating(true)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded font-serif shadow-elegant hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" /> New {config.singular}
          </button>
        )}
      </header>
      <div className="ornament-divider mb-6 text-accent" />

      <div className="bg-card border border-border rounded-lg shadow-elegant overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary">
              <tr>
                {config.fields.map((f) => (
                  <th key={f.key} className="text-left px-4 py-3 font-serif text-sm uppercase tracking-wider text-secondary-foreground">
                    {f.label}
                  </th>
                ))}
                {isAdmin && <th className="px-4 py-3 w-32"></th>}
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={config.fields.length + 1} className="text-center py-12 italic text-muted-foreground">
                    Loading the ledger…
                  </td>
                </tr>
              )}
              {!isLoading && rows.length === 0 && (
                <tr>
                  <td colSpan={config.fields.length + 1} className="text-center py-12 italic text-muted-foreground">
                    The ledger is empty.
                  </td>
                </tr>
              )}
              {rows.map((row) => (
                <tr key={String(row[config.pk])} className="border-t border-border hover:bg-secondary/50">
                  {config.fields.map((f) => (
                    <td key={f.key} className="px-4 py-3 text-card-foreground">
                      {displayValue(f, row[f.key])}
                    </td>
                  ))}
                  {isAdmin && (
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setEditing(row)}
                        className="inline-flex items-center justify-center h-8 w-8 rounded hover:bg-accent/30 text-primary"
                        aria-label="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete this ${config.singular.toLowerCase()}?`))
                            deleteRow.mutate(row[config.pk]);
                        }}
                        className="inline-flex items-center justify-center h-8 w-8 rounded hover:bg-destructive/20 text-destructive"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {(creating || editing) && (
        <RecordForm
          config={config}
          refs={refs}
          initial={editing ?? undefined}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
        />
      )}

    </AppShell>
  );
}

function RecordForm({
  config, initial, refs, onClose,
}: {
  config: TableConfig;
  initial?: Row;
  refs: Record<string, Row[]>;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const editable = config.fields.filter((f) => !f.hideInForm);
  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const f of editable) {
      const v = initial?.[f.key];
      init[f.key] = v === null || v === undefined ? "" : String(v);
    }
    return init;
  });

  const save = useMutation({
    mutationFn: async () => {
      const payload: Row = {};
      for (const f of editable) {
        const raw = values[f.key];
        if (raw === "" || raw === undefined) {
          payload[f.key] = null;
        } else if (f.type === "number") {
          payload[f.key] = Number(raw);
        } else {
          payload[f.key] = raw;
        }
      }
      if (initial) {
        const { error } = await supabase
          .from(config.name as never)
          .update(payload as never)
          .eq(config.pk, initial[config.pk] as never);
        if (error) throw error;
      } else {
        const { error } = await supabase.from(config.name as never).insert(payload as never);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(initial ? "Updated" : "Created");
      qc.invalidateQueries({ queryKey: ["table", config.name] });
      qc.invalidateQueries({ queryKey: ["dashboard-counts"] });
      onClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg shadow-elegant w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-serif text-2xl text-primary">
            {initial ? "Edit" : "New"} {config.singular}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-secondary rounded">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            save.mutate();
          }}
          className="p-5 space-y-4"
        >
          {editable.map((f) => (
            <label key={f.key} className="block">
              <span className="block font-serif text-sm text-foreground mb-1">
                {f.label} {f.required && <span className="text-destructive">*</span>}
              </span>
              {f.type === "select" ? (
                <select
                  required={f.required}
                  value={values[f.key]}
                  onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                  className="input-classical"
                >
                  <option value="">— Select —</option>
                  {f.options?.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                  {f.ref &&
                    (refs[f.ref.table] ?? []).map((r) => (
                      <option key={String(r[f.ref!.valueKey])} value={String(r[f.ref!.valueKey])}>
                        {String(r[f.ref!.labelKey] ?? r[f.ref!.valueKey])}
                      </option>
                    ))}
                </select>
              ) : (
                <input
                  type={f.type === "number" ? "number" : f.type === "date" ? "date" : "text"}
                  step={f.type === "number" ? "any" : undefined}
                  required={f.required}
                  value={values[f.key]}
                  onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                  className="input-classical"
                />
              )}
            </label>
          ))}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-border rounded py-2 font-serif hover:bg-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={save.isPending}
              className="flex-1 bg-primary text-primary-foreground rounded py-2 font-serif shadow-elegant disabled:opacity-60"
            >
              {save.isPending ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
