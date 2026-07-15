import { Dispatch, SetStateAction, useCallback, useMemo, useState } from "react";

/**
 * The helpers returned as the second tuple element of {@link useStep}.
 */
export interface UseStepActions {
  /** Advance to the next step (no-op when already at `maxStep`). */
  goToNextStep: () => void;
  /** Go back to the previous step (no-op when already at step 1). */
  goToPrevStep: () => void;
  /** Reset back to step 1. */
  reset: () => void;
  /** Whether a next step is available. */
  canGoToNextStep: boolean;
  /** Whether a previous step is available. */
  canGoToPrevStep: boolean;
  /** Set the step directly (1-indexed); throws if out of the `1..maxStep` range. */
  setStep: Dispatch<SetStateAction<number>>;
}

/**
 * A custom hook to manage a 1-indexed step counter (e.g. for wizards/steppers).
 *
 * @param maxStep - The highest reachable step (inclusive). Steps run from `1` to `maxStep`.
 * @returns A tuple of the current step and an actions object.
 */
export const useStep = (maxStep: number): [number, UseStepActions] => {
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
