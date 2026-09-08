"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Star, ShieldCheck, CheckCircle2, Trash2 } from "lucide-react";
import { clsx } from "clsx";

export function PropertyRowActions({
  id,
  featured,
  verified,
  listingStatus,
}: {
  id: string;
  featured: boolean;
  verified: boolean;
  listingStatus: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function patch(body: Record<string, unknown>) {
    setLoading(true);
    try {
      await fetch(`/api/admin/properties/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function remove() {
    if (!confirm("Delete this property? This cannot be undone.")) return;
    setLoading(true);
    try {
      await fetch(`/api/admin/properties/${id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-1.5">
      <IconToggle
        active={featured}
        disabled={loading}
        label="Feature"
        icon={Star}
        onClick={() => patch({ featured: !featured })}
      />
      <IconToggle
        active={verified}
        disabled={loading}
        label="Verify"
        icon={ShieldCheck}
        onClick={() => patch({ verified: !verified })}
      />
      <IconToggle
        active={listingStatus === "SOLD"}
        disabled={loading}
        label="Mark Sold"
        icon={CheckCircle2}
        onClick={() => patch({ listingStatus: listingStatus === "SOLD" ? "PUBLISHED" : "SOLD" })}
      />
      <button
        onClick={remove}
        disabled={loading}
        aria-label="Delete"
        className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 hover:bg-red-500/10 disabled:opacity-40"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

function IconToggle({
  active,
  disabled,
  label,
  icon: Icon,
  onClick,
}: {
  active: boolean;
  disabled: boolean;
  label: string;
  icon: React.ElementType;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={clsx(
        "flex h-8 w-8 items-center justify-center rounded-lg disabled:opacity-40",
        active ? "bg-gold-500/20 text-gold-600" : "text-slate-400 hover:bg-navy-950/5"
      )}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
