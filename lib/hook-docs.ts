import type { ComponentType } from "react";
import type { ApiRow } from "@/components/ApiTable";
import { UseToggleDocDemo } from "@/components/demos/use-toggle-demo";

/* Per-hook page content layered on top of the registry entry (docs/DESIGN.md
   §4): live demo component, usage snippet (shown in the HookDemo Code tab AND
   the Usage section — one string, always identical), API tables. T7–T10 add
   the remaining hooks; a slug without an entry renders the signature-only
   scaffold. Data here must match the hookli@1.3.16 type declarations. */

export type HookDoc = {
  demo: ComponentType;
  usage: string;
  parameters: readonly ApiRow[];
  returns: readonly ApiRow[];
};

const HOOK_DOCS: Partial<Record<string, HookDoc>> = {
  "use-toggle": {
    demo: UseToggleDocDemo,
    usage: `
import { useToggle } from "hookli";

export function Demo() {
  const [on, toggle, setOn] = useToggle(false);

  return (
    <div>
      <button onClick={toggle}>{on ? "On" : "Off"}</button>
      <button onClick={() => setOn(true)}>Set on</button>
      <button onClick={() => setOn(false)}>Set off</button>
    </div>
  );
}
`,
    parameters: [
      {
        name: "initialValue",
        type: "boolean",
        defaultValue: "false",
        description: "The value the toggle starts from.",
      },
    ],
    returns: [
      {
        name: "[0] value",
        type: "boolean",
        description: "The current boolean state.",
      },
      {
        name: "[1] toggle",
        type: "() => void",
        description: "Flips the value.",
      },
      {
        name: "[2] setValue",
        type: "(value: boolean) => void",
        description: "Sets the value explicitly.",
      },
    ],
  },
};

export function getHookDoc(slug: string): HookDoc | undefined {
  return HOOK_DOCS[slug];
}
