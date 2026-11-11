"use client";

import { useMutation } from "hookli";
import { DemoButton, DemoReadout } from "./ui";

const saveUserData = async (name: string) => {
  await new Promise((resolve) => setTimeout(resolve, 600));
  return { id: 101, name, savedAt: new Date().toLocaleTimeString() };
};

export function UseMutationDocDemo() {
  const { mutate, data, isLoading, status, reset } = useMutation(saveUserData);

  return (
    <div className="flex flex-col items-center gap-5">
      <dl className="w-full max-w-sm">
        <DemoReadout label="status">
          <span className={status === "success" ? "text-accent" : "text-gray-body"}>
            {status}
          </span>
        </DemoReadout>
        <DemoReadout label="result">
          {data ? JSON.stringify(data) : "(none)"}
        </DemoReadout>
      </dl>
      <div className="flex flex-wrap justify-center gap-3">
        <DemoButton
          disabled={isLoading}
          onClick={() => mutate("John Doe")}
        >
          {isLoading ? "Saving..." : "Mutate (Save)"}
        </DemoButton>
        <DemoButton disabled={status === "idle"} onClick={reset}>
          Reset
        </DemoButton>
      </div>
    </div>
  );
}
