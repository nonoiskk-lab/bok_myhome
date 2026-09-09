"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { CheckCircle2, XCircle, Clock } from "lucide-react";

type Followup = {
  id: string;
  dueAt: string;
  note: string | null;
  status: string;
};

export function FollowupsPanel({ customerId, followups }: { customerId: string; followups: Followup[] }) {
  const router = useRouter();
  const [dueAt, setDueAt] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function addFollowup(e: FormEvent) {
    e.preventDefault();
    if (!dueAt) return;
    setSubmitting(true);
    try {
      await fetch(`/api/admin/customers/${customerId}/followups`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dueAt: new Date(dueAt).toISOString(), note }),
      });
      setDueAt("");
      setNote("");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  async function updateStatus(id: string, status: "DONE" | "MISSED") {
    setBusyId(id);
    try {
      await fetch(`/api/admin/followups/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  const pending = followups.filter((f) => f.status === "PENDING");
  const resolved = followups.filter((f) => f.status !== "PENDING");

  return (
    <div>
      <form onSubmit={addFollowup} className="flex flex-wrap items-end gap-2">
        <label className="flex flex-col gap-1 text-xs text-slate-500">
          Date &amp; time
          <input
            type="datetime-local"
            value={dueAt}
            onChange={(e) => setDueAt(e.target.value)}
            required
            className="rounded-lg border border-navy-950/15 px-2.5 py-1.5 text-xs"
          />
        </label>
        <label className="flex flex-1 min-w-[160px] flex-col gap-1 text-xs text-slate-500">
          Note
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Customer wants quotation"
            className="rounded-lg border border-navy-950/15 px-2.5 py-1.5 text-xs"
          />
        </label>
        <button
          type="submit"
          disabled={submitting || !dueAt}
          className="rounded-lg bg-navy-950 px-3 py-1.5 text-xs font-semibold text-cream-50 disabled:opacity-50"
        >
          {submitting ? "Scheduling..." : "Schedule"}
        </button>
      </form>

      {pending.length > 0 && (
        <ul className="mt-4 space-y-2">
          {pending.map((f) => (
            <li key={f.id} className="flex items-start justify-between gap-2 rounded-xl border border-gold-500/30 bg-gold-500/5 p-3">
              <div className="flex items-start gap-2">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" />
                <div>
                  <p className="text-sm font-medium text-navy-950">
                    {new Date(f.dueAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" })}
                  </p>
                  {f.note && <p className="text-xs text-slate-500">{f.note}</p>}
                </div>
              </div>
              <div className="flex shrink-0 gap-1">
                <button
                  type="button"
                  disabled={busyId === f.id}
                  onClick={() => updateStatus(f.id, "DONE")}
                  aria-label="Mark done"
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-green-600 hover:bg-green-500/10 disabled:opacity-50"
                >
                  <CheckCircle2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  disabled={busyId === f.id}
                  onClick={() => updateStatus(f.id, "MISSED")}
                  aria-label="Mark missed"
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-red-500 hover:bg-red-500/10 disabled:opacity-50"
                >
                  <XCircle className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {pending.length === 0 && <p className="mt-4 text-sm text-slate-500">No upcoming follow-ups.</p>}

      {resolved.length > 0 && (
        <details className="mt-4">
          <summary className="cursor-pointer text-xs text-slate-500">Past follow-ups ({resolved.length})</summary>
          <ul className="mt-2 space-y-1.5">
            {resolved.map((f) => (
              <li key={f.id} className="text-xs text-slate-400">
                {new Date(f.dueAt).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" })} — {f.note || "—"} (
                {f.status === "DONE" ? "Completed" : "Missed"})
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
