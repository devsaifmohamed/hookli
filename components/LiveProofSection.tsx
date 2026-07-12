import { CodeBlock } from "@/components/CodeBlock";
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
      <h2 className="text-center text-2xl">
        This demo is running the code beside it.
      </h2>
      <p className="mx-auto mt-3 max-w-lg text-center text-gray-body">
        The preview imports <code className="text-sm">useToggle</code> straight
        from the published npm package — the same code you&apos;d ship.
      </p>
      <div className="mt-10 grid items-stretch gap-4 lg:grid-cols-2">
        <CodeBlock code={SAMPLE} title="light-switch.tsx" />
        <div className="flex min-h-[180px] flex-col overflow-hidden rounded-xl border border-slate-syntax/40 bg-ground-raised">
          <p className="border-b border-slate-syntax/40 px-4 py-[15px] text-xs text-gray-body">
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
