export function FeatureCard({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-xl border border-slate-syntax/40 bg-ground-raised p-6">
      <span className="text-accent">{icon}</span>
      <h3 className="mt-4 font-mono text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-gray-body">{body}</p>
    </div>
  );
}
