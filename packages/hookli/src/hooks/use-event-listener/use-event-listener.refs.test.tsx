import { StrictMode, useRef, type ReactNode } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useEventListener } from "./use-event-listener";

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
  vi.restoreAllMocks();
});

// Net listeners currently attached = adds minus removes on a spied target.
const net = (add: { mock: { calls: unknown[] } }, rem: { mock: { calls: unknown[] } }) =>
  add.mock.calls.length - rem.mock.calls.length;

/* ---------- components ---------- */

// Ref element that appears/disappears via `show`.
function Toggle({ show, handler }: { show: boolean; handler: (e: Event) => void }) {
  const ref = useRef<HTMLButtonElement>(null);
  useEventListener("click", handler, ref);
  return show ? <button ref={ref} data-testid="t">t</button> : <span>none</span>;
}

// Ref never attached to anything.
function NullRef({ handler }: { handler: (e: Event) => void }) {
  const ref = useRef<HTMLButtonElement>(null);
  useEventListener("click", handler, ref);
  return <span>nothing mounted</span>;
}

// Two elements swapped by key, same ref.
function Swap({ which, handler }: { which: "a" | "b"; handler: (e: Event) => void }) {
  const ref = useRef<HTMLButtonElement>(null);
  useEventListener("click", handler, ref);
  return which === "a" ? (
    <button key="a" ref={ref} data-testid="a">a</button>
  ) : (
    <button key="b" ref={ref} data-testid="b">b</button>
  );
}

// Hook bound to a caller-provided, stable ref object (lets tests spy before mount).
function Direct({
  target,
  handler,
  options,
  eventName = "click",
}: {
  target: { current: any };
  handler: (e: any) => void;
  options?: boolean | AddEventListenerOptions;
  eventName?: string;
}) {
  useEventListener(eventName as any, handler, target as any, options as any);
  return null;
}

function WindowKey({ handler, name = "keydown" }: { handler: (e: any) => void; name?: string }) {
  useEventListener(name as any, handler as any);
  return null;
}

function Inline({ handler, tick, target }: { handler: (e: any) => void; tick: number; target: { current: any } }) {
  // Options literal is re-created on every render.
  useEventListener("click", handler, target as any, { capture: false });
  return <span data-tick={tick}>{tick}</span>;
}

function HandlerChange({ tick, target, seen }: { tick: number; target: { current: any }; seen: number[] }) {
  // New closure every render.
  useEventListener("click", () => seen.push(tick), target as any);
  return null;
}

function Svg({ handler }: { handler: (e: any) => void }) {
  const ref = useRef<SVGSVGElement>(null);
  useEventListener("click", handler, ref);
  return (
    <svg ref={ref} data-testid="svg">
      <circle data-testid="circle" r={5} />
    </svg>
  );
}

function Mql({ handler, mql }: { handler: (e: any) => void; mql: { current: any } }) {
  useEventListener("change", handler, mql as any);
  return null;
}

function Wrap({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

describe("useEventListener with refs", () => {
  it("late mount: element mounted after first render gets the listener and handler fires on it", () => {
    const handler = vi.fn();
    const { rerender } = render(<Toggle show={false} handler={handler} />);
    rerender(<Toggle show={true} handler={handler} />);

    const btn = screen.getByTestId("t");
    // Non-bubbling event: a window fallback listener cannot receive it, so only
    // a listener actually attached to the element can call the handler.
    btn.dispatchEvent(new Event("click"));

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0].target).toBe(btn);
  });

  it("null ref: clicks on window, body and document do NOT call the handler while ref.current is null", () => {
    const handler = vi.fn();
    render(<NullRef handler={handler} />);

    window.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    document.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    fireEvent.click(document.body);
    fireEvent.click(document.documentElement);

    expect(handler).not.toHaveBeenCalled();
  });

  it("swap: element A replaced by B (different key) - B fires, A is detached from the listener", () => {
    const handler = vi.fn();
    const { rerender } = render(<Swap which="a" handler={handler} />);

    const a = screen.getByTestId("a");
    const removeA = vi.spyOn(a, "removeEventListener");

    rerender(<Swap which="b" handler={handler} />);
    const b = screen.getByTestId("b");
    expect(b).not.toBe(a);
    expect(removeA).toHaveBeenCalledTimes(1);

    // Dispatch on the detached A: must not reach the handler.
    a.dispatchEvent(new MouseEvent("click"));
    expect(handler).not.toHaveBeenCalled();

    fireEvent.click(b);
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0].target).toBe(b);
  });

  it("unmount then remount toggled 3 times: exactly one call per click each time", () => {
    const handler = vi.fn();
    const { rerender } = render(<Toggle show={false} handler={handler} />);

    let expected = 0;
    for (let i = 0; i < 3; i++) {
      rerender(<Toggle show={true} handler={handler} />);
      fireEvent.click(screen.getByTestId("t"));
      expected += 1;
      expect(handler).toHaveBeenCalledTimes(expected);

      rerender(<Toggle show={false} handler={handler} />);
      fireEvent.click(document.body);
      expect(handler).toHaveBeenCalledTimes(expected);
    }
  });

  it("component unmount: removeEventListener gets the SAME listener and options that were added; no calls after", () => {
    const el = document.createElement("button");
    const target = { current: el };
    const addSpy = vi.spyOn(el, "addEventListener");
    const removeSpy = vi.spyOn(el, "removeEventListener");
    const handler = vi.fn();
    const opts = { capture: true };

    const { unmount } = render(<Direct target={target} handler={handler} options={opts} />);
    expect(addSpy).toHaveBeenCalledTimes(1);
    const [addType, addListener, addOptions] = addSpy.mock.calls[0];

    unmount();
    expect(removeSpy).toHaveBeenCalledTimes(1);
    const [remType, remListener, remOptions] = removeSpy.mock.calls[0];

    expect(remType).toBe(addType);
    expect(remListener).toBe(addListener);
    expect(remOptions).toEqual(addOptions);
    expect(remOptions).toEqual({ capture: true });

    el.dispatchEvent(new MouseEvent("click"));
    expect(handler).not.toHaveBeenCalled();
  });

  it("no ref: listens on window (keydown on window fires)", () => {
    const addSpy = vi.spyOn(window, "addEventListener");
    const handler = vi.fn();
    const { unmount } = render(<WindowKey handler={handler} />);

    expect(addSpy.mock.calls.some((c) => c[0] === "keydown")).toBe(true);

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "a" }));
    expect(handler).toHaveBeenCalledTimes(1);

    unmount();
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "a" }));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("document ref ({ current: document }) listens on document, not window", () => {
    const handler = vi.fn();
    const target = { current: document };
    render(<Direct target={target} handler={handler} />);

    fireEvent.click(document.body); // bubbles to document
    expect(handler).toHaveBeenCalledTimes(1);

    window.dispatchEvent(new MouseEvent("click")); // does not reach document
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("SVG element ref: click on child circle bubbles to the svg listener", () => {
    const handler = vi.fn();
    render(<Svg handler={handler} />);

    fireEvent.click(screen.getByTestId("circle"));
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0].target).toBe(screen.getByTestId("circle"));
  });

  it("MediaQueryList ref: subscribes 'change' on the fake MQL and unsubscribes on unmount", () => {
    const fakeMql = {
      matches: false,
      media: "(min-width: 1px)",
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
    const mql = { current: fakeMql };
    const handler = vi.fn();

    const { unmount } = render(<Mql handler={handler} mql={mql} />);

    expect(fakeMql.addEventListener).toHaveBeenCalledTimes(1);
    const [type, listener] = fakeMql.addEventListener.mock.calls[0];
    expect(type).toBe("change");
    expect(typeof listener).toBe("function");

    const evt = { matches: true } as unknown as Event;
    (listener as (e: Event) => void)(evt);
    expect(handler).toHaveBeenCalledWith(evt);

    unmount();
    expect(fakeMql.removeEventListener).toHaveBeenCalledWith("change", listener, undefined);
  });

  it("eventName change re-subscribes: old event no longer fires, new one does", () => {
    const handler = vi.fn();
    const { rerender } = render(<WindowKey handler={handler} name="keydown" />);

    window.dispatchEvent(new KeyboardEvent("keydown"));
    expect(handler).toHaveBeenCalledTimes(1);

    rerender(<WindowKey handler={handler} name="keyup" />);

    window.dispatchEvent(new KeyboardEvent("keydown"));
    expect(handler).toHaveBeenCalledTimes(1);

    window.dispatchEvent(new KeyboardEvent("keyup"));
    expect(handler).toHaveBeenCalledTimes(2);
  });

  it("options change capture:true -> capture:false: old removed with old options, new added with new options", () => {
    const el = document.createElement("button");
    const target = { current: el };
    const addSpy = vi.spyOn(el, "addEventListener");
    const removeSpy = vi.spyOn(el, "removeEventListener");
    const handler = vi.fn();

    const { rerender } = render(<Direct target={target} handler={handler} options={{ capture: true }} />);
    const [, firstListener] = addSpy.mock.calls[0];

    rerender(<Direct target={target} handler={handler} options={{ capture: false }} />);

    expect(removeSpy).toHaveBeenCalledTimes(1);
    expect(removeSpy.mock.calls[0][1]).toBe(firstListener);
    expect(removeSpy.mock.calls[0][2]).toEqual({ capture: true });

    expect(addSpy).toHaveBeenCalledTimes(2);
    expect(addSpy.mock.calls[1][2]).toEqual({ capture: false });

    el.dispatchEvent(new MouseEvent("click"));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("options change to { once: true }: old removed with old (undefined) options, new added with once; fires once only", () => {
    const el = document.createElement("button");
    const target = { current: el };
    const addSpy = vi.spyOn(el, "addEventListener");
    const removeSpy = vi.spyOn(el, "removeEventListener");
    const handler = vi.fn();

    const { rerender } = render(<Direct target={target} handler={handler} options={undefined} />);
    const [, firstListener] = addSpy.mock.calls[0];

    el.dispatchEvent(new MouseEvent("click"));
    expect(handler).toHaveBeenCalledTimes(1);

    rerender(<Direct target={target} handler={handler} options={{ once: true }} />);

    expect(removeSpy).toHaveBeenCalledWith("click", firstListener, undefined);
    expect(addSpy).toHaveBeenCalledTimes(2);
    expect(addSpy.mock.calls[1][2]).toEqual({ once: true });

    el.dispatchEvent(new MouseEvent("click"));
    el.dispatchEvent(new MouseEvent("click"));
    expect(handler).toHaveBeenCalledTimes(2);
  });

  it("inline options literal re-created every render: handler once per click, no listener leak", () => {
    const el = document.createElement("button");
    const target = { current: el };
    const addSpy = vi.spyOn(el, "addEventListener");
    const removeSpy = vi.spyOn(el, "removeEventListener");
    const handler = vi.fn();

    const { rerender, unmount } = render(<Inline handler={handler} tick={0} target={target} />);
    for (let t = 1; t <= 5; t++) {
      rerender(<Inline handler={handler} tick={t} target={target} />);
    }

    // An inline options object is a new value every render, so the listener is re-subscribed;
    // exactly one stays attached.
    expect(net(addSpy, removeSpy)).toBe(1);

    el.dispatchEvent(new MouseEvent("click"));
    expect(handler).toHaveBeenCalledTimes(1);

    unmount();
    expect(net(addSpy, removeSpy)).toBe(0);
    el.dispatchEvent(new MouseEvent("click"));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("handler identity changes every render: listener NOT re-attached, latest handler is called", () => {
    const el = document.createElement("button");
    const target = { current: el };
    const addSpy = vi.spyOn(el, "addEventListener");
    const removeSpy = vi.spyOn(el, "removeEventListener");
    const seen: number[] = [];

    const { rerender } = render(<HandlerChange tick={0} target={target} seen={seen} />);
    for (let t = 1; t <= 5; t++) {
      rerender(<HandlerChange tick={t} target={target} seen={seen} />);
    }

    expect(addSpy).toHaveBeenCalledTimes(1);
    expect(removeSpy).toHaveBeenCalledTimes(0);

    el.dispatchEvent(new MouseEvent("click"));
    expect(seen).toEqual([5]);
  });

  it("React StrictMode: exactly one handler call per event, and no listener left after unmount", () => {
    const el = document.createElement("button");
    document.body.appendChild(el);
    const target = { current: el };
    const addSpy = vi.spyOn(el, "addEventListener");
    const removeSpy = vi.spyOn(el, "removeEventListener");
    const handler = vi.fn();

    const { unmount } = render(
      <StrictMode>
        <Direct target={target} handler={handler} />
      </StrictMode>,
    );

    // Strict double-invokes effects: expect net one attached listener.
    expect(net(addSpy, removeSpy)).toBe(1);

    fireEvent.click(el);
    expect(handler).toHaveBeenCalledTimes(1);

    unmount();
    expect(net(addSpy, removeSpy)).toBe(0);

    fireEvent.click(el);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("StrictMode with a real ref element: one call per click, none after unmount", () => {
    const handler = vi.fn();
    const { unmount } = render(
      <StrictMode>
        <Toggle show={true} handler={handler} />
      </StrictMode>,
    );

    const btn = screen.getByTestId("t");
    fireEvent.click(btn);
    expect(handler).toHaveBeenCalledTimes(1);

    unmount();
    fireEvent.click(btn);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("re-render with same element: addEventListener count does not grow", () => {
    const el = document.createElement("button");
    const target = { current: el };
    const addSpy = vi.spyOn(el, "addEventListener");
    const handler = vi.fn();

    const { rerender } = render(
      <Wrap>
        <Direct target={target} handler={handler} />
      </Wrap>,
    );
    for (let i = 0; i < 5; i++) {
      rerender(
        <Wrap>
          <Direct target={target} handler={handler} />
        </Wrap>,
      );
    }

    expect(addSpy).toHaveBeenCalledTimes(1);

    el.dispatchEvent(new MouseEvent("click"));
    expect(handler).toHaveBeenCalledTimes(1);
  });
});
