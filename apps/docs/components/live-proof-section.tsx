import { CodeBlock } from "@/components/code-block";
import { SectionHeading } from "@/components/section-heading";
import { UseToggleDemo } from "@/components/demos/use-toggle-demo";

/* The demo component mirrors this sample line for line (plus styling classes) —
   keep the two in sync. See components/demos/use-toggle-demo.tsx. */
const SAMPLE = `
import { useToggle } from "hookli";

export function LightSwitch() {
  const [on, toggle] = useToggle(false);

  return (
    <button onClick={toggle} aria-pressed={on}>
      {on ? "On" : "Off"}
    </button>
  );
}
`;

export function LiveProofSection() {
  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-20 sm:px-6">
      <SectionHeading
        eyebrow="Live proof"
        title="This demo runs the code beside it"
        subtitle={
          <>
            The preview imports <code className="text-sm">useToggle</code> straight from the published npm package — the same code you&apos;d ship.
          </>
        }
      />
      <div className="mt-12 grid items-stretch gap-4 lg:grid-cols-2">
        <CodeBlock code={SAMPLE} title="light-switch.tsx" />
        <div className="surface flex min-h-[180px] flex-col overflow-hidden rounded-xl">
          <p className="flex items-center gap-2 border-b border-slate-syntax px-4 py-[15px] text-xs text-gray-body">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-accent/70" />
            live · imported from hookli
          </p>
          <div className="flex flex-1 items-center justify-center p-8">
            <UseToggleDemo />
          </div>
        </div>
      </div>
    </section>
  );
}
