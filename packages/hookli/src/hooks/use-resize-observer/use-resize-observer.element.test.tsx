import { StrictMode, useState } from "react";
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { useResizeObserver } from "./use-resize-observer";

type Rec = { el: Element; cb: ResizeObserverCallback; off: boolean };
let recs: Rec[] = [];
const saved = globalThis.ResizeObserver;
beforeEach(() => {
  recs = [];
  globalThis.ResizeObserver = class {
    private rec?: Rec;
    constructor(private cb: ResizeObserverCallback) {}
    observe(el: Element) {
      this.rec = { el, cb: this.cb, off: false };
      recs.push(this.rec);
    }
    unobserve() {}
    disconnect() {
      if (this.rec) this.rec.off = true;
    }
  } as unknown as typeof ResizeObserver;
});
afterEach(() => {
  globalThis.ResizeObserver = saved;
  cleanup();
});
const live = () => recs.filter((r) => !r.off);
const fire = (rec: Rec, width: number) =>
  act(() => rec.cb([{ contentRect: { width, height: 10 } } as unknown as ResizeObserverEntry], {} as ResizeObserver));

function Child({ setEl }: { setEl: (el: HTMLDivElement | null) => void }) {
  const [show, setShow] = useState(false);
  return (
    <>
      <button onClick={() => setShow((s) => !s)}>child-toggle</button>
      {show && <div data-testid="target" ref={setEl} />}
    </>
  );
}

function Owner() {
  const [el, setEl] = useState<HTMLDivElement | null>(null);
  const { width } = useResizeObserver(el);
  return (
    <>
      <Child setEl={setEl} />
      <span data-testid="w">{String(width)}</span>
    </>
  );
}

describe("useResizeObserver with an element", () => {
  it("measures an element that a child component mounts with its own state", () => {
    const r = render(<Owner />);
    expect(recs).toHaveLength(0);
    fireEvent.click(r.getByText("child-toggle"));
    expect(live()).toHaveLength(1);
    expect(live()[0].el).toBe(r.getByTestId("target"));
    fire(live()[0], 240);
    expect(r.getByTestId("w").textContent).toBe("240");
  });

  it("disconnects when the child unmounts the element and observes it again on remount", () => {
    const r = render(<Owner />);
    fireEvent.click(r.getByText("child-toggle"));
    fireEvent.click(r.getByText("child-toggle"));
    expect(live()).toHaveLength(0);
    fireEvent.click(r.getByText("child-toggle"));
    expect(live()).toHaveLength(1);
    expect(live()[0].el).toBe(r.getByTestId("target"));
  });

  it("null observes nothing", () => {
    function C() {
      const { width } = useResizeObserver(null as HTMLDivElement | null);
      return <span data-testid="w">{String(width)}</span>;
    }
    const r = render(<C />);
    expect(recs).toHaveLength(0);
    expect(r.getByTestId("w").textContent).toBe("undefined");
  });

  it("StrictMode: one live observer after mount, none after unmount", () => {
    const r = render(<StrictMode><Owner /></StrictMode>);
    fireEvent.click(r.getByText("child-toggle"));
    expect(live()).toHaveLength(1);
    r.unmount();
    expect(live()).toHaveLength(0);
  });
});
