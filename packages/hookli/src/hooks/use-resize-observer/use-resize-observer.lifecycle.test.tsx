import { StrictMode, useRef, useState } from "react";
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { useResizeObserver } from "./use-resize-observer";

// jsdom has no ResizeObserver: a fake that records each observer and lets the test fire it.
type Rec = { el: Element; box?: string; cb: ResizeObserverCallback; off: boolean };
let recs: Rec[] = [];
const saved = globalThis.ResizeObserver;
beforeEach(() => {
  recs = [];
  globalThis.ResizeObserver = class {
    private rec?: Rec;
    constructor(private cb: ResizeObserverCallback) {}
    observe(el: Element, opts?: ResizeObserverOptions) {
      this.rec = { el, box: opts?.box, cb: this.cb, off: false };
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

const fire = (rec: Rec, width: number, height: number) =>
  act(() =>
    rec.cb(
      [{ contentBoxSize: [{ inlineSize: width, blockSize: height }], contentRect: { width, height } } as unknown as ResizeObserverEntry],
      {} as ResizeObserver,
    ),
  );
const live = () => recs.filter((r) => !r.off);

function Box({ show, k, box }: { show: boolean; k: string; box?: ResizeObserverBoxOptions }) {
  const ref = useRef<HTMLDivElement>(null);
  const { width } = useResizeObserver(ref, { box });
  return (
    <>
      {show && <div key={k} ref={ref} />}
      <span data-testid="w">{String(width)}</span>
    </>
  );
}

describe("useResizeObserver lifecycle", () => {
  it("issue #12: measures an element mounted after the first render", () => {
    function Late() {
      const [open, setOpen] = useState(false);
      const ref = useRef<HTMLDivElement>(null);
      const { width } = useResizeObserver(ref);
      return (
        <>
          <button onClick={() => setOpen(true)}>open</button>
          <span data-testid="w">{String(width)}</span>
          {open && <div ref={ref} />}
        </>
      );
    }
    const r = render(<Late />);
    expect(recs).toHaveLength(0);
    fireEvent.click(r.getByText("open"));
    expect(live()).toHaveLength(1);
    fire(live()[0], 120, 40);
    expect(r.getByTestId("w").textContent).toBe("120");
  });

  it("StrictMode: one live observer after mount, none after unmount", () => {
    const r = render(<StrictMode><Box show k="a" /></StrictMode>);
    expect(live()).toHaveLength(1);
    r.unmount();
    expect(live()).toHaveLength(0);
  });

  it("reports the same size again for a remounted element", () => {
    const r = render(<Box show k="a" />);
    fire(live()[0], 100, 10);
    expect(r.getByTestId("w").textContent).toBe("100");
    r.rerender(<Box show={false} k="a" />);
    expect(live()).toHaveLength(0);
    r.rerender(<Box show k="a" />);
    expect(live()).toHaveLength(1);
    fire(live()[0], 100, 10);
    expect(r.getByTestId("w").textContent).toBe("100");
  });

  it("a swap and a box change each leave exactly one live observer on the right element and box", () => {
    const r = render(<Box show k="a" />);
    const first = live()[0].el;
    r.rerender(<Box show k="b" />);
    expect(live()).toHaveLength(1);
    expect(live()[0].el).not.toBe(first);
    r.rerender(<Box show k="b" box="border-box" />);
    expect(live()).toHaveLength(1);
    expect(live()[0].box).toBe("border-box");
    expect(recs).toHaveLength(3);
  });

  it("re-renders with the same element create no new observers", () => {
    const r = render(<Box show k="a" />);
    for (let i = 0; i < 10; i++) r.rerender(<Box show k="a" />);
    expect(recs).toHaveLength(1);
  });
});
