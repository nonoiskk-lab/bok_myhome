"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { RefreshCw } from "lucide-react";

const STATUS_STYLE: Record<string, string> = {
  SUCCESS: "bg-green-500/10 text-green-600",
  FAILED: "bg-red-500/10 text-red-500",
  PENDING: "bg-slate-500/10 text-slate-500",
  NOT_CONFIGURED: "bg-amber-500/10 text-amber-600",
};

function Badge({ label, status }: { label: string; status: string }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_STYLE[status] ?? STATUS_STYLE.PENDING}`}>
      {label}: {status.replace(/_/g, " ")}
    </span>
  );
}

export function LeadSyncStatus({
  id,
  googleSheetStatus,
  whatsappStatus,
}: {
  id: string;
  googleSheetStatus: string;
  whatsappStatus: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const needsRetry = googleSheetStatus === "FAILED" || whatsappStatus === "FAILED";

  async function retry() {
    setLoading(true);
    try {
      await fetch(`/api/admin/leads/${id}/sync`, { method: "POST" });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-1.5">
      <div className="flex flex-wrap gap-1.5">
        <Badge label="Sheet" status={googleSheetStatus} />
        <Badge label="WhatsApp" status={whatsappStatus} />
      </div>
      {needsRetry && (
        <button
          type="button"
          onClick={retry}
          disabled={loading}
          className="flex items-center gap-1 text-[11px] font-medium text-navy-900 hover:text-gold-600 disabled:opacity-50"
        >
          <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Retrying..." : "Retry sync"}
        </button>
      )}
    </div>
  );
}
