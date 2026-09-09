"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  LEAD_STATUSES,
  LEAD_STATUS_LABELS,
  LEAD_PRIORITIES,
  LEAD_PRIORITY_LABELS,
  type LeadStatusValue,
  type LeadPriorityValue,
} from "@/lib/constants";

export function CustomerStatusPriority({
  id,
  status,
  priority,
  assignedTo,
}: {
  id: string;
  status: string;
  priority: string;
  assignedTo: string | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [assignee, setAssignee] = useState(assignedTo ?? "");

  async function patch(body: Record<string, string>) {
    setLoading(true);
    try {
      await fetch(`/api/admin/customers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <label className="flex items-center gap-2 text-xs text-slate-500">
        Status
        <select
          value={status}
          disabled={loading}
          onChange={(e) => patch({ status: e.target.value })}
          className="rounded-lg border border-navy-950/15 px-2.5 py-1.5 text-xs font-medium text-navy-950 disabled:opacity-50"
        >
          {LEAD_STATUSES.map((s) => (
            <option key={s} value={s}>
              {LEAD_STATUS_LABELS[s as LeadStatusValue]}
            </option>
          ))}
        </select>
      </label>

      <label className="flex items-center gap-2 text-xs text-slate-500">
        Priority
        <select
          value={priority}
          disabled={loading}
          onChange={(e) => patch({ priority: e.target.value })}
          className="rounded-lg border border-navy-950/15 px-2.5 py-1.5 text-xs font-medium text-navy-950 disabled:opacity-50"
        >
          {LEAD_PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {LEAD_PRIORITY_LABELS[p as LeadPriorityValue]}
            </option>
          ))}
        </select>
      </label>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          patch({ assignedTo: assignee });
        }}
        className="flex items-center gap-1.5 text-xs text-slate-500"
      >
        Assigned to
        <input
          value={assignee}
          onChange={(e) => setAssignee(e.target.value)}
          placeholder="Salesperson name"
          disabled={loading}
          className="w-36 rounded-lg border border-navy-950/15 px-2.5 py-1.5 text-xs disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg border border-navy-950/15 px-2.5 py-1.5 text-xs font-medium text-navy-900 hover:bg-navy-950/5 disabled:opacity-50"
        >
          Save
        </button>
      </form>
    </div>
  );
}
