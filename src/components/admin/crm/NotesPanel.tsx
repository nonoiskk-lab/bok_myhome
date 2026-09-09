"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

type Note = { id: string; body: string; createdBy: string | null; createdAt: string };

export function NotesPanel({ customerId, notes }: { customerId: string; notes: Note[] }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function addNote(e: FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setSubmitting(true);
    try {
      await fetch(`/api/admin/customers/${customerId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      setBody("");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <form onSubmit={addNote} className="flex flex-col gap-2">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder='e.g. "Customer is comparing with another dealer."'
          rows={2}
          className="rounded-lg border border-navy-950/15 px-3 py-2 text-sm focus:border-gold-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={submitting || !body.trim()}
          className="self-start rounded-lg bg-navy-950 px-3 py-1.5 text-xs font-semibold text-cream-50 disabled:opacity-50"
        >
          {submitting ? "Adding..." : "Add note"}
        </button>
      </form>

      <ul className="mt-4 space-y-3">
        {notes.map((n) => (
          <li key={n.id} className="rounded-xl border border-navy-950/8 bg-navy-950/[0.02] p-3">
            <p className="text-sm text-navy-950">{n.body}</p>
            <p className="mt-1 text-[11px] text-slate-400">
              {n.createdBy ?? "Admin"} ·{" "}
              {new Date(n.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" })}
            </p>
          </li>
        ))}
        {notes.length === 0 && <p className="text-sm text-slate-500">No notes yet.</p>}
      </ul>
    </div>
  );
}
