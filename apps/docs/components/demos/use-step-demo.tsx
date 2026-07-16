"use client";

import { useStep } from "hookli";
import { DemoButton, DemoReadout } from "./ui";

const MAX_STEP = 4;

/* Docs-page demo (DH1): a 1-indexed stepper. Back/Next disable at the bounds via
   canGoToPrevStep/canGoToNextStep. Mirrors the usage snippet in lib/hook-docs.ts
   — keep in sync. */
export function UseStepDocDemo() {
  const [
    step,
    { goToNextStep, goToPrevStep, canGoToNextStep, canGoToPrevStep, reset },
  ] = useStep(MAX_STEP);

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex items-center gap-2" aria-hidden="true">
        {Array.from({ length: MAX_STEP }, (_, i) => (
          <span
            key={i}
            className={`size-3 rounded-full transition-colors duration-200 ${
              i + 1 <= step ? "bg-accent" : "bg-gray-body/40"
            }`}
          />
        ))}
      </div>
      <dl className="w-full max-w-xs">
        <DemoReadout label="step">
          {step} / {MAX_STEP}
        </DemoReadout>
      </dl>
      <div className="flex flex-wrap justify-center gap-3">
        <DemoButton onClick={goToPrevStep} disabled={!canGoToPrevStep}>
          Back
        </DemoButton>
        <DemoButton onClick={goToNextStep} disabled={!canGoToNextStep}>
          Next
        </DemoButton>
        <DemoButton onClick={reset}>Reset</DemoButton>
      </div>
    </div>
  );
}
