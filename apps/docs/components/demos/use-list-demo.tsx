"use client";

import { useList } from "hookli";
import { DemoButton, DemoReadout } from "./ui";

const INITIAL_ITEMS = ["apple", "banana", "cherry"];

export function UseListDocDemo() {
  const [list, { push, removeAt, clear, reset }] = useList<string>(INITIAL_ITEMS);

  return (
    <div className="flex flex-col items-center gap-5">
      <dl className="w-full max-w-sm">
        <DemoReadout label={`items (${list.length})`}>
          {list.length === 0 ? <span className="text-gray-body">(empty)</span> : list.join(", ")}
        </DemoReadout>
      </dl>
      <div className="flex flex-wrap justify-center gap-3">
        <DemoButton onClick={() => push(`item-${list.length + 1}`)}>
          Push item
        </DemoButton>
        <DemoButton
          disabled={list.length === 0}
          onClick={() => removeAt(list.length - 1)}
        >
          Pop item
        </DemoButton>
        <DemoButton disabled={list.length === 0} onClick={clear}>
          Clear
        </DemoButton>
        <DemoButton onClick={reset}>Reset</DemoButton>
      </div>
    </div>
  );
}
