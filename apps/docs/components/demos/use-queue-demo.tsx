"use client";

import { useQueue } from "hookli";
import { DemoButton, DemoReadout } from "./ui";

export function UseQueueDocDemo() {
  const { queue, add, remove, clear, first, last, size } = useQueue<string>([
    "first",
    "second",
  ]);

  return (
    <div className="flex flex-col items-center gap-5">
      <dl className="w-full max-w-sm">
        <DemoReadout label="queue">
          {queue.length === 0 ? (
            <span className="text-gray-body">(empty)</span>
          ) : (
            queue.join(" → ")
          )}
        </DemoReadout>
        <DemoReadout label="first (head)">{first ?? "(none)"}</DemoReadout>
        <DemoReadout label="last (tail)">{last ?? "(none)"}</DemoReadout>
        <DemoReadout label="size">{size}</DemoReadout>
      </dl>
      <div className="flex flex-wrap justify-center gap-3">
        <DemoButton onClick={() => add(`task-${size + 1}`)}>
          Enqueue
        </DemoButton>
        <DemoButton disabled={size === 0} onClick={() => remove()}>
          Dequeue
        </DemoButton>
        <DemoButton disabled={size === 0} onClick={clear}>
          Clear
        </DemoButton>
      </div>
    </div>
  );
}
