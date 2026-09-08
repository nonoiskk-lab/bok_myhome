export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="container-page max-w-3xl py-12">
      <h1 className="font-serif text-3xl text-navy-950">{title}</h1>
      <p className="mt-1 text-xs text-slate-400">Last updated: {updated}</p>
      <div className="prose prose-slate mt-8 max-w-none space-y-4 text-sm leading-relaxed text-slate-700 [&_h2]:mt-6 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-navy-950">
        {children}
      </div>
    </div>
  );
}
