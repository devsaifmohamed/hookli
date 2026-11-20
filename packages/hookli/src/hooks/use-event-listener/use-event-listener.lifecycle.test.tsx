import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useEventListener } from "./use-event-listener";

afterEach(() => {
  vi.unstubAllGlobals();
  cleanup();
});

describe("useEventListener lifecycle", () => {
  it("issue #12: an element mounted after the first render gets the listener, and window does not", () => {
    const targets: string[] = [];
    const onClick = vi.fn((e: Event) => targets.push(e.currentTarget === e.target ? "element" : "other"));
    function Clicker() {
      const [open, setOpen] = useState(false);
      const ref = useRef<HTMLDivElement>(null);
      useEventListener("click", onClick, ref);
      return (
        <>
          <button onClick={() => setOpen(true)}>open</button>
          {open && <div data-testid="box" ref={ref}>box</div>}
        </>
      );
    }
    const r = render(<Clicker />);
    fireEvent.click(r.getByText("open"));
    fireEvent.click(document.body);
    expect(onClick).not.toHaveBeenCalled();
    fireEvent.click(r.getByTestId("box"));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(targets).toEqual(["element"]);
  });

  it("moves from window to the element and back when the ref argument is added and removed", () => {
    const onKey = vi.fn();
    function Switch({ withRef }: { withRef: boolean }) {
      const ref = useRef<HTMLInputElement>(null);
      // The overloads take a ref or nothing; this test switches between the two at runtime.
      useEventListener("keydown", onKey, (withRef ? ref : undefined) as typeof ref);
      return <input data-testid="i" ref={ref} />;
    }
    const r = render(<Switch withRef={false} />);
    fireEvent.keyDown(window);
    expect(onKey).toHaveBeenCalledTimes(1);
    r.rerender(<Switch withRef />);
    fireEvent.keyDown(window);
    expect(onKey).toHaveBeenCalledTimes(1);
    fireEvent.keyDown(r.getByTestId("i"));
    expect(onKey).toHaveBeenCalledTimes(2);
    r.rerender(<Switch withRef={false} />);
    fireEvent.keyDown(window);
    expect(onKey).toHaveBeenCalledTimes(3);
  });

  // <Activity> exists from React 19.2; the React 18 CI job skips this.
  const Activity = (React as unknown as { Activity?: React.ComponentType<{ mode: "visible" | "hidden"; children: React.ReactNode }> }).Activity;
  it.skipIf(!Activity)("detaches while an <Activity> is hidden and re-attaches when it is shown", () => {
    const A = Activity!;
    const onClick = vi.fn();
    function Panel() {
      const ref = useRef<HTMLDivElement>(null);
      useEventListener("click", onClick, ref);
      return <div data-testid="p" ref={ref}>panel</div>;
    }
    const ui = (mode: "visible" | "hidden") => <A mode={mode}><Panel /></A>;
    const r = render(ui("visible"));
    const el = r.getByTestId("p");
    fireEvent.click(el);
    expect(onClick).toHaveBeenCalledTimes(1);
    r.rerender(ui("hidden"));
    fireEvent.click(el);
    expect(onClick).toHaveBeenCalledTimes(1);
    r.rerender(ui("visible"));
    fireEvent.click(r.getByTestId("p"));
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  // Effects that run where `window` is missing (non-DOM hosts) must not throw or subscribe.
  // `window` is removed only while this component's effects run, in declaration order.
  it("with no window and no ref, attaches nothing and does not throw", () => {
    const handler = vi.fn();
    const realWindow = window;
    const add = vi.spyOn(realWindow, "addEventListener");
    function C() {
      useEffect(() => {
        vi.stubGlobal("window", undefined);
      });
      useEventListener("resize", handler);
      useEffect(() => {
        vi.unstubAllGlobals();
      });
      return null;
    }
    expect(() => render(<C />)).not.toThrow();
    expect(add.mock.calls.filter((c) => c[0] === "resize")).toHaveLength(0);
    realWindow.dispatchEvent(new Event("resize"));
    expect(handler).not.toHaveBeenCalled();
  });
});
