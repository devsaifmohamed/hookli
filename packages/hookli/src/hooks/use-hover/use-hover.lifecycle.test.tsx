import { useRef, useState, type RefObject } from "react";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { useHover } from "./use-hover";

afterEach(cleanup);

describe("useHover lifecycle", () => {
  it("issue #12: reports hover on an element mounted after the first render", () => {
    function Hover() {
      const [open, setOpen] = useState(false);
      const ref = useRef<HTMLDivElement>(null);
      const hovered = useHover(ref);
      return (
        <>
          <button onClick={() => setOpen(true)}>open</button>
          {open && <div data-testid="h" ref={ref}>{String(hovered)}</div>}
        </>
      );
    }
    const r = render(<Hover />);
    fireEvent.click(r.getByText("open"));
    fireEvent.mouseEnter(r.getByTestId("h"));
    expect(r.getByTestId("h").textContent).toBe("true");
  });

  it("issue #12: follows the ref to a new element after a swap", () => {
    function Swap() {
      const [which, setWhich] = useState("a");
      const ref = useRef<HTMLDivElement>(null);
      const hovered = useHover(ref);
      return (
        <>
          <button onClick={() => setWhich("b")}>swap</button>
          {which === "a" ? <div key="a" data-testid="a" ref={ref} /> : <div key="b" data-testid="b" ref={ref} />}
          <span data-testid="s">{String(hovered)}</span>
        </>
      );
    }
    const r = render(<Swap />);
    fireEvent.mouseEnter(r.getByTestId("a"));
    expect(r.getByTestId("s").textContent).toBe("true");
    fireEvent.mouseLeave(r.getByTestId("a"));
    fireEvent.click(r.getByText("swap"));
    fireEvent.mouseEnter(r.getByTestId("b"));
    expect(r.getByTestId("s").textContent).toBe("true");
  });

  it("tracks an element rendered by a child when the parent's state mounts it", () => {
    function Child({ innerRef }: { innerRef: RefObject<HTMLDivElement | null> }) {
      return <div data-testid="c" ref={innerRef}>child</div>;
    }
    function Parent() {
      const [show, setShow] = useState(false);
      const ref = useRef<HTMLDivElement>(null);
      const hovered = useHover(ref);
      return (
        <>
          <button onClick={() => setShow(true)}>show</button>
          {show && <Child innerRef={ref} />}
          <span data-testid="h">{String(hovered)}</span>
        </>
      );
    }
    const r = render(<Parent />);
    fireEvent.click(r.getByText("show"));
    fireEvent.mouseEnter(r.getByTestId("c"));
    expect(r.getByTestId("h").textContent).toBe("true");
  });
});
