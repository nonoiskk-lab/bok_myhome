import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { syncLead } from "@/lib/leads/sync";

// Manual retry for a lead whose Google Sheet / WhatsApp sync failed or is
// still pending — the lead itself is never re-created, only re-synced.
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const lead = await prisma.lead.findUnique({ where: { id } });
  if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

  await syncLead(id);
  const updated = await prisma.lead.findUnique({ where: { id } });

  return NextResponse.json({ ok: true, lead: updated });
}
