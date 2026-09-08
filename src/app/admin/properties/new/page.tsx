import { AdminPropertyForm } from "@/components/admin/AdminPropertyForm";

export default function NewPropertyPage() {
  return (
    <div>
      <h1 className="font-serif text-2xl text-navy-950">Add Property</h1>
      <p className="mt-1 text-sm text-slate-600">New listings publish immediately in this demo — production would route through review first.</p>
      <div className="mt-6">
        <AdminPropertyForm />
      </div>
    </div>
  );
}
