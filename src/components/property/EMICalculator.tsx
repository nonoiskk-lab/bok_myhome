"use client";

import { useMemo, useState } from "react";
import { formatIndianNumber } from "@/lib/format";
import { WhatsAppButton } from "@/components/WhatsAppButton";

export function EMICalculator({ propertyPrice }: { propertyPrice: number }) {
  const [price, setPrice] = useState(propertyPrice);
  const [downPaymentPct, setDownPaymentPct] = useState(20);
  const [rate, setRate] = useState(8.5);
  const [tenure, setTenure] = useState(20);

  const { emi, totalInterest, totalPayment, loanAmount } = useMemo(() => {
    const downPayment = (price * downPaymentPct) / 100;
    const principal = Math.max(price - downPayment, 0);
    const monthlyRate = rate / 12 / 100;
    const months = tenure * 12;
    const emiValue =
      monthlyRate === 0
        ? principal / months
        : (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
          (Math.pow(1 + monthlyRate, months) - 1);
    const total = emiValue * months;
    return {
      emi: Math.round(emiValue || 0),
      totalInterest: Math.round((total || 0) - principal),
      totalPayment: Math.round(total || 0),
      loanAmount: Math.round(principal),
    };
  }, [price, downPaymentPct, rate, tenure]);

  return (
    <div className="rounded-2xl border border-navy-950/8 bg-white p-6">
      <h3 className="font-semibold text-navy-950">EMI Calculator</h3>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Property Price (₹)">
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            className="w-full rounded-lg border border-navy-950/15 px-3 py-2 text-sm"
          />
        </Field>
        <Field label={`Down Payment (${downPaymentPct}%)`}>
          <input
            type="range"
            min={0}
            max={80}
            value={downPaymentPct}
            onChange={(e) => setDownPaymentPct(Number(e.target.value))}
            className="w-full accent-gold-500"
          />
        </Field>
        <Field label={`Interest Rate (${rate}% p.a.)`}>
          <input
            type="range"
            min={6}
            max={14}
            step={0.1}
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            className="w-full accent-gold-500"
          />
        </Field>
        <Field label={`Loan Tenure (${tenure} yrs)`}>
          <input
            type="range"
            min={1}
            max={30}
            value={tenure}
            onChange={(e) => setTenure(Number(e.target.value))}
            className="w-full accent-gold-500"
          />
        </Field>
      </div>

      <div className="mt-5 rounded-xl bg-navy-950 p-5 text-cream-50">
        <Stat label="Monthly EMI" value={`₹${formatIndianNumber(emi)}`} highlight />
        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-cream-50/10 pt-4">
          <Stat label="Loan Amount" value={`₹${formatIndianNumber(loanAmount)}`} />
          <Stat label="Total Interest" value={`₹${formatIndianNumber(totalInterest)}`} />
        </div>
      </div>
      <p className="mt-2 text-xs text-slate-500">
        Total payment over tenure: ₹{formatIndianNumber(totalPayment)}. Estimates only — actual loan
        terms depend on your lender and eligibility.
      </p>

      <WhatsAppButton
        className="mt-4 w-full"
        message="Hi, I'd like to talk to a home loan expert about financing options for a property."
        label="Talk to a Home Loan Expert"
      />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-600">{label}</span>
      {children}
    </label>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-cream-100/70">{label}</p>
      <p
        className={
          highlight
            ? "text-2xl font-bold text-gold-400 truncate"
            : "text-base font-semibold text-cream-50 truncate"
        }
        title={value}
      >
        {value}
      </p>
    </div>
  );
}
