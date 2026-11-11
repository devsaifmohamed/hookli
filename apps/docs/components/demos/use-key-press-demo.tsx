"use client";

import { useKeyPress } from "hookli";
import { DemoReadout } from "./ui";

export function UseKeyPressDocDemo() {
  const enterPressed = useKeyPress("Enter");
  const spacePressed = useKeyPress(" ");
  const escapePressed = useKeyPress("Escape");

  return (
    <div className="flex flex-col items-center gap-5">
      <dl className="w-full max-w-xs">
        <DemoReadout label="Enter">
          <span className={enterPressed ? "text-accent font-semibold" : "text-gray-body"}>
            {enterPressed ? "Pressed" : "Released"}
          </span>
        </DemoReadout>
        <DemoReadout label="Space">
          <span className={spacePressed ? "text-accent font-semibold" : "text-gray-body"}>
            {spacePressed ? "Pressed" : "Released"}
          </span>
        </DemoReadout>
        <DemoReadout label="Escape">
          <span className={escapePressed ? "text-accent font-semibold" : "text-gray-body"}>
            {escapePressed ? "Pressed" : "Released"}
          </span>
        </DemoReadout>
      </dl>
      <p className="text-center text-xs text-gray-body">
        Press and hold Enter, Space, or Escape on your keyboard.
      </p>
    </div>
  );
}
