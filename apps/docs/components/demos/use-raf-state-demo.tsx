"use client";

import { useRafState } from "hookli";
import { DemoReadout } from "./ui";

export function UseRafStateDocDemo() {
  const [pos, setPos] = useRafState({ x: 0, y: 0 });

  return (
    <div className="flex flex-col items-center gap-5">
      <dl className="w-full max-w-xs">
        <DemoReadout label="x">{pos.x}px</DemoReadout>
        <DemoReadout label="y">{pos.y}px</DemoReadout>
      </dl>
      <div
        onPointerMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          setPos({
            x: Math.round(e.clientX - rect.left),
            y: Math.round(e.clientY - rect.top),
          });
        }}
        className="flex h-32 w-full max-w-sm cursor-crosshair items-center justify-center rounded-lg border border-dashed border-gray-outline bg-ground text-xs text-gray-body select-none"
      >
        Move pointer here (batched to requestAnimationFrame)
      </div>
    </div>
  );
}
