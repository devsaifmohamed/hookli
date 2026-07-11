import type { ComponentType } from "react";
import type { ApiRow } from "@/components/ApiTable";
import { UseDebounceDocDemo } from "@/components/demos/use-debounce-demo";
import { UseFormDocDemo } from "@/components/demos/use-form-demo";
import { UseLocalStorageDocDemo } from "@/components/demos/use-local-storage-demo";
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
  "use-debounce": {
    demo: UseDebounceDocDemo,
    usage: `
import { useState } from "react";
import { useDebounce } from "hookli";

export function Demo() {
  const [text, setText] = useState("");
  const debounced = useDebounce(text, 500);

  return (
    <div>
      <input value={text} onChange={(e) => setText(e.target.value)} />
      <p>Value: {text}</p>
      <p>Debounced: {debounced}</p>
    </div>
  );
}
`,
    parameters: [
      {
        name: "value",
        type: "T",
        description: "The value to debounce — any type works.",
      },
      {
        name: "delay",
        type: "number",
        description:
          "Milliseconds the value must stay unchanged before the debounced value updates.",
      },
    ],
    returns: [
      {
        name: "debouncedValue",
        type: "T",
        description:
          "Trails the input value, updating only after delay ms without a change.",
      },
    ],
  },
  "use-form": {
    demo: UseFormDocDemo,
    usage: `
import { useForm } from "hookli";

export function Demo() {
  const { values, handleChange, resetForm } = useForm({ name: "", email: "" });

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <input name="name" value={values.name} onChange={handleChange} />
      <input name="email" type="email" value={values.email} onChange={handleChange} />
      <button type="button" onClick={resetForm}>Reset</button>
    </form>
  );
}
`,
    parameters: [
      {
        name: "initialState",
        type: "T",
        description:
          "Initial field values. Keys must match the name attribute of each input.",
      },
    ],
    returns: [
      {
        name: "values",
        type: "T",
        description: "The current form values.",
      },
      {
        name: "handleChange",
        type: "(event: ChangeEvent) => void",
        description:
          "One change handler for every named input, textarea and select.",
      },
      {
        name: "resetForm",
        type: "() => void",
        description: "Restores initialState.",
      },
    ],
  },
  "use-local-storage": {
    demo: UseLocalStorageDocDemo,
    usage: `
import { useLocalStorage } from "hookli";

export function Demo() {
  const { value, setStoredValue } = useLocalStorage("note", "");

  return (
    <div>
      <input value={value} onChange={(e) => setStoredValue(e.target.value)} />
      <button type="button" onClick={() => setStoredValue("")}>Clear</button>
    </div>
  );
}
`,
    parameters: [
      {
        name: "key",
        type: "string",
        description: "The localStorage key to read and write.",
      },
      {
        name: "initialValue",
        type: "T",
        description:
          "Value used before hydration and when the key is empty. Prefer a stable reference — the sync effect depends on it.",
      },
    ],
    returns: [
      {
        name: "value",
        type: "T",
        description:
          "The stored value. Server-rendered as initialValue, then synced from localStorage after mount.",
      },
      {
        name: "setStoredValue",
        type: "(value: T | ((val: T) => T)) => void",
        description:
          "Persists to localStorage and updates state; accepts a value or an updater function.",
      },
    ],
  },
};

export function getHookDoc(slug: string): HookDoc | undefined {
  return HOOK_DOCS[slug];
}
