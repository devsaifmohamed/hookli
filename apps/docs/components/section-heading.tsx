type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  subtitle?: React.ReactNode;
  className?: string;
};

/* Shared landing section header: a tracked accent eyebrow, a confident
   text-3xl title, and an optional subtitle — one rhythm across every section. */
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  className = "",
}: SectionHeadingProps) {
  return (
    <div className={`mx-auto flex max-w-2xl flex-col items-center text-center ${className}`}>
      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
        {eyebrow}
      </span>
      <h2 className="mt-3 text-3xl">{title}</h2>
      {subtitle && <p className="mt-3 text-gray-body">{subtitle}</p>}
    </div>
  );
}
