"use client";

import { useWindowScroll } from "hookli";
import { DemoButton, DemoReadout } from "./ui";

export function UseWindowScrollDocDemo() {
  const { x, y } = useWindowScroll();

  return (
    <div className="flex flex-col items-center gap-5">
      <dl className="w-full max-w-xs">
        <DemoReadout label="scroll x">{Math.round(x)}px</DemoReadout>
        <DemoReadout label="scroll y">{Math.round(y)}px</DemoReadout>
      </dl>
      <div className="flex flex-wrap justify-center gap-3">
        <DemoButton onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          Scroll to Top
        </DemoButton>
        <DemoButton onClick={() => window.scrollBy({ top: 200, behavior: "smooth" })}>
          Scroll +200px
        </DemoButton>
      </div>
    </div>
  );
}
