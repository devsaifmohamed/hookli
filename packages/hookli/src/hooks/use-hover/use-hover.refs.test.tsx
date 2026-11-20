import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { StrictMode, useEffect, useRef, useState, type RefObject } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useHover } from "./use-hover";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

/* ------------------------------------------------------------------ */
/* Components                                                           */
/* ------------------------------------------------------------------ */

// Element is absent at mount and appears after a button click.
function LateMount() {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);
  const hovered = useHover(ref);
  return (
    <div>
      <output data-testid="state">{String(hovered)}</output>
      <button onClick={() => setShow(true)}>show</button>
      {show ? <div data-testid="target" ref={ref}>target</div> : null}
    </div>
  );
}

// Element A is replaced by element B (different key) on click.
function Swap() {
  const ref = useRef<HTMLDivElement>(null);
  const [version, setVersion] = useState<"a" | "b">("a");
  const hovered = useHover(ref);
  return (
    <div>
      <output data-testid="state">{String(hovered)}</output>
      <button onClick={() => setVersion((v) => (v === "a" ? "b" : "a"))}>swap</button>
      {version === "a" ? (
        <div key="a" data-testid="a" ref={ref}>A</div>
      ) : (
        <div key="b" data-testid="b" ref={ref}>B</div>
      )}
    </div>
  );
}

// Element present from first render, toggled off/on by a button.
function Toggle() {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(true);
  const hovered = useHover(ref);
  return (
    <div>
      <output data-testid="state">{String(hovered)}</output>
      <button onClick={() => setShow((s) => !s)}>toggle</button>
      {show ? <div data-testid="target" ref={ref}>target</div> : null}
    </div>
  );
}

// Element never rendered.
function NeverRendered() {
  const ref = useRef<HTMLDivElement>(null);
  const hovered = useHover(ref);
  return <output data-testid="state">{String(hovered)}</output>;
}

// Element present; used for unmount checks.
function Simple() {
  const ref = useRef<HTMLDivElement>(null);
  const hovered = useHover(ref);
  return (
    <div>
      <output data-testid="state">{String(hovered)}</output>
      <div data-testid="target" ref={ref}>target</div>
    </div>
  );
}

// Records every committed value of `hovered` so transitions can be counted.
function Logged({ log }: { log: boolean[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const hovered = useHover(ref);
  useEffect(() => {
    log.push(hovered);
  }, [hovered, log]);
  return <div data-testid="target" ref={ref}>target</div>;
}

// Two independent hooks on two elements.
function TwoHooks() {
  const refA = useRef<HTMLDivElement>(null);
  const refB = useRef<HTMLDivElement>(null);
  const hoverA = useHover(refA);
  const hoverB = useHover(refB);
  return (
    <div>
      <output data-testid="a-state">{String(hoverA)}</output>
      <output data-testid="b-state">{String(hoverB)}</output>
      <div data-testid="a" ref={refA}>A</div>
      <div data-testid="b" ref={refB}>B</div>
    </div>
  );
}

// SVG rect target. useHover is typed for HTMLElement refs, so the ref is cast
// (types are not checked by vitest; this only exercises runtime behaviour).
function SvgRect() {
  const ref = useRef<SVGRectElement>(null);
  const hovered = useHover(ref as unknown as RefObject<HTMLElement>);
  return (
    <div>
      <output data-testid="state">{String(hovered)}</output>
      <svg>
        <rect data-testid="rect" ref={ref} width={10} height={10} />
      </svg>
    </div>
  );
}

// Parent target with a child element inside.
function WithChild() {
  const ref = useRef<HTMLDivElement>(null);
  const hovered = useHover(ref);
  return (
    <div>
      <output data-testid="state">{String(hovered)}</output>
      <div data-testid="parent" ref={ref}>
        <span data-testid="child">child</span>
      </div>
    </div>
  );
}

// Element removed while hovered: toggled via button, same as Toggle.
// (Reuses Toggle; separate name kept for readability of the test.)

// Child owns the element and its own state; the host component never re-renders.
function ChildOwnsElement({ innerRef }: { innerRef: RefObject<HTMLDivElement | null> }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <button onClick={() => setShow(true)}>child-show</button>
      {show ? <div data-testid="target" ref={innerRef}>target</div> : null}
    </div>
  );
}
function HostWithChildOwnedElement() {
  const ref = useRef<HTMLDivElement>(null);
  const hovered = useHover(ref);
  return (
    <div>
      <output data-testid="state">{String(hovered)}</output>
      <ChildOwnsElement innerRef={ref} />
    </div>
  );
}

const hoverState = (getByTestId: (id: string) => HTMLElement) =>
  getByTestId("state").textContent;

const enter = (el: Element) => act(() => {
  el.dispatchEvent(new MouseEvent("mouseenter"));
});
const leave = (el: Element) => act(() => {
  el.dispatchEvent(new MouseEvent("mouseleave"));
});

/* ------------------------------------------------------------------ */
/* Tests                                                                */
/* ------------------------------------------------------------------ */

describe("useHover with late-mounted and swapped elements", () => {
  it("late mount: element appears after a click; mouseenter -> true, mouseleave -> false", () => {
    const { getByText, getByTestId } = render(<LateMount />);
    expect(hoverState(getByTestId)).toBe("false");

    fireEvent.click(getByText("show"));
    const target = getByTestId("target");

    fireEvent.mouseEnter(target);
    expect(hoverState(getByTestId)).toBe("true");

    fireEvent.mouseLeave(target);
    expect(hoverState(getByTestId)).toBe("false");
  });

  it("swap: A replaced by B (different key); B hover works, detached A is ignored", () => {
    const { getByText, getByTestId, queryByTestId } = render(<Swap />);
    const elA = getByTestId("a");

    fireEvent.click(getByText("swap"));
    expect(queryByTestId("a")).toBeNull();
    const elB = getByTestId("b");
    expect(elB).not.toBe(elA);

    fireEvent.mouseEnter(elB);
    expect(hoverState(getByTestId)).toBe("true");
    fireEvent.mouseLeave(elB);
    expect(hoverState(getByTestId)).toBe("false");

    // Events on the detached node must not change state.
    fireEvent.mouseEnter(elA);
    expect(hoverState(getByTestId)).toBe("false");
    fireEvent.mouseLeave(elA);
    expect(hoverState(getByTestId)).toBe("false");
  });

  it("toggle element off/on 5 times: hover still works after each re-mount", () => {
    const { getByText, getByTestId } = render(<Toggle />);

    for (let i = 1; i <= 5; i++) {
      fireEvent.click(getByText("toggle")); // hide
      fireEvent.click(getByText("toggle")); // show
      const target = getByTestId("target");

      fireEvent.mouseEnter(target);
      expect(hoverState(getByTestId), `iteration ${i} enter`).toBe("true");
      fireEvent.mouseLeave(target);
      expect(hoverState(getByTestId), `iteration ${i} leave`).toBe("false");
    }
  });

  it("element null: window / document / body mouse events do NOT flip state to true", () => {
    const { getByTestId } = render(<NeverRendered />);
    expect(hoverState(getByTestId)).toBe("false");

    act(() => {
      window.dispatchEvent(new MouseEvent("mouseenter"));
    });
    expect(hoverState(getByTestId)).toBe("false");

    act(() => {
      window.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
      document.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
      document.body.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
      document.body.dispatchEvent(new MouseEvent("mouseenter"));
    });
    expect(hoverState(getByTestId)).toBe("false");
  });

  it("unmount: no React/console errors or warnings, and listener is removed", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const { getByTestId, unmount } = render(<Simple />);
    const target = getByTestId("target");
    const removeSpy = vi.spyOn(target, "removeEventListener");

    enter(target);
    expect(hoverState(getByTestId)).toBe("true");

    unmount();
    expect(removeSpy).toHaveBeenCalledWith("mouseenter", expect.any(Function), undefined);
    expect(removeSpy).toHaveBeenCalledWith("mouseleave", expect.any(Function), undefined);

    // Events after unmount must not cause React work (no setState on unmounted tree).
    expect(() => enter(target)).not.toThrow();
    expect(() => leave(target)).not.toThrow();

    expect(errorSpy).not.toHaveBeenCalled();
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it("StrictMode: hover works and each mouse event causes exactly one transition", () => {
    const log: boolean[] = [];
    const { getByTestId } = render(
      <StrictMode>
        <Logged log={log} />
      </StrictMode>,
    );
    // Mount under StrictMode runs effects twice; discard those entries.
    log.length = 0;

    const target = getByTestId("target");
    enter(target);
    expect(log).toEqual([true]);

    leave(target);
    expect(log).toEqual([true, false]);

    // Late-mount variant under StrictMode.
    cleanup();
    const { getByText, getByTestId: getById2 } = render(
      <StrictMode>
        <LateMount />
      </StrictMode>,
    );
    fireEvent.click(getByText("show"));
    fireEvent.mouseEnter(getById2("target"));
    expect(hoverState(getById2)).toBe("true");
    fireEvent.mouseLeave(getById2("target"));
    expect(hoverState(getById2)).toBe("false");
  });

  it("two hooks on two elements in one component are independent", () => {
    const { getByTestId } = render(<TwoHooks />);
    const a = getByTestId("a");
    const b = getByTestId("b");

    enter(a);
    expect(getByTestId("a-state").textContent).toBe("true");
    expect(getByTestId("b-state").textContent).toBe("false");

    enter(b);
    expect(getByTestId("a-state").textContent).toBe("true");
    expect(getByTestId("b-state").textContent).toBe("true");

    leave(a);
    expect(getByTestId("a-state").textContent).toBe("false");
    expect(getByTestId("b-state").textContent).toBe("true");

    leave(b);
    expect(getByTestId("b-state").textContent).toBe("false");
  });

  it("SVG element ref (<svg><rect ref/></svg>) works", () => {
    const { getByTestId } = render(<SvgRect />);
    const rect = getByTestId("rect");
    expect(rect instanceof SVGElement).toBe(true);

    fireEvent.mouseEnter(rect);
    expect(hoverState(getByTestId)).toBe("true");
    fireEvent.mouseLeave(rect);
    expect(hoverState(getByTestId)).toBe("false");
  });

  it("known limitation: element removed while hovered leaves isHovered stuck at true", () => {
    const { getByText, getByTestId, queryByTestId } = render(<Toggle />);
    const target = getByTestId("target");

    enter(target);
    expect(hoverState(getByTestId)).toBe("true");

    // Remove the element while the pointer is over it. No mouseleave is dispatched
    // by the DOM on removal, so the hook has no event to react to.
    fireEvent.click(getByText("toggle"));
    expect(queryByTestId("target")).toBeNull();
    expect(hoverState(getByTestId)).toBe("true"); // known limitation: stays true

    // Re-show with the pointer elsewhere: still reports true with no events.
    fireEvent.click(getByText("toggle"));
    expect(hoverState(getByTestId)).toBe("true"); // known limitation: stale

    // Normal events on the new element still resync the state.
    const fresh = getByTestId("target");
    leave(fresh);
    expect(hoverState(getByTestId)).toBe("false");
  });

  it("existing element from first render still works (regression) and ignores window events", () => {
    const { getByTestId } = render(<Simple />);
    const target = getByTestId("target");

    enter(target);
    expect(hoverState(getByTestId)).toBe("true");
    leave(target);
    expect(hoverState(getByTestId)).toBe("false");

    act(() => {
      window.dispatchEvent(new MouseEvent("mouseenter"));
    });
    expect(hoverState(getByTestId)).toBe("false");
  });

});
