import { Dispatch, SetStateAction, useCallback, useMemo, useState } from "react";

export interface UseStepActions {
  /** Advances to the next step; a no-op at maxStep. */
  goToNextStep: () => void;
  /** Goes back one step; a no-op at step 1. */
  goToPrevStep: () => void;
  /** Resets back to step 1. */
  reset: () => void;
  canGoToNextStep: boolean;
  canGoToPrevStep: boolean;
  /** Sets the step directly (1-indexed); throws if outside the 1..maxStep range. */
  setStep: Dispatch<SetStateAction<number>>;
}

/**
 * A custom hook to manage a 1-indexed step counter (e.g. for wizards/steppers).
 *
 * @category state
 * @keywords wizard, stepper, steps, onboarding flow, next step, previous step, multi step form
 * @param maxStep - The highest reachable step (inclusive). Steps run from 1 to maxStep.
 *
 * @example Usage
 * ```tsx
 * import { useStep } from "hookli";
 *
 * export function Demo() {
 *   const [step, { goToNextStep, goToPrevStep, canGoToNextStep, canGoToPrevStep, reset }] =
 *     useStep(4);
 *
 *   return (
 *     <div>
 *       <p>Step {step} of 4</p>
 *       <button onClick={goToPrevStep} disabled={!canGoToPrevStep}>Back</button>
 *       <button onClick={goToNextStep} disabled={!canGoToNextStep}>Next</button>
 *       <button onClick={reset}>Reset</button>
 *     </div>
 *   );
 * }
 * ```
 */
export const useStep = (maxStep: number): [step: number, actions: UseStepActions] => {
  const [currentStep, setCurrentStep] = useState<number>(1);

  const canGoToNextStep = useMemo(() => currentStep + 1 <= maxStep, [currentStep, maxStep]);
  const canGoToPrevStep = useMemo(() => currentStep - 1 >= 1, [currentStep]);

  const setStep = useCallback<Dispatch<SetStateAction<number>>>(
    (step) => {
      setCurrentStep((prev) => {
        const newStep = step instanceof Function ? step(prev) : step;
        if (newStep >= 1 && newStep <= maxStep) {
          return newStep;
        }
        throw new Error("Step not valid");
      });
    },
    [maxStep],
  );

  const goToNextStep = useCallback(() => {
    setCurrentStep((prev) => (prev + 1 <= maxStep ? prev + 1 : prev));
  }, [maxStep]);

  const goToPrevStep = useCallback(() => {
    setCurrentStep((prev) => (prev - 1 >= 1 ? prev - 1 : prev));
  }, []);

  const reset = useCallback(() => {
    setCurrentStep(1);
  }, []);

  return [currentStep, { goToNextStep, goToPrevStep, canGoToNextStep, canGoToPrevStep, setStep, reset }];
};
