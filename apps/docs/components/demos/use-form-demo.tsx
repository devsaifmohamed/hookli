"use client";

import { useForm } from "hookli";
import { DemoButton, DemoInput } from "./ui";

/* Mirrors the usage snippet in lib/hook-docs.ts — keep in sync. */
export function UseFormDocDemo() {
  const { values, handleChange, resetForm } = useForm({ name: "", email: "" });

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <form
        className="flex flex-col gap-4"
        onSubmit={(event) => event.preventDefault()}
      >
        <DemoInput
          label="name"
          name="name"
          value={values.name}
          onChange={handleChange}
          placeholder="Ada Lovelace"
          autoComplete="off"
        />
        <DemoInput
          label="email"
          name="email"
          type="email"
          value={values.email}
          onChange={handleChange}
          placeholder="ada@example.com"
          autoComplete="off"
        />
        <div>
          <DemoButton onClick={resetForm}>Reset</DemoButton>
        </div>
      </form>
      <pre className="overflow-x-auto rounded-md border border-slate-syntax/20 bg-ground p-3 font-mono text-xs leading-relaxed text-gray-body">
        {JSON.stringify(values, null, 2)}
      </pre>
    </div>
  );
}
