import { StrictMode, useState } from "react";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { useHover } from "./use-hover";

afterEach(cleanup);

function Child({ setEl }: { setEl: (el: HTMLDivElement | null) => void }) {
  const [show, setShow] = useState(false);
  return (
    <>
      <button onClick={() => setShow((s) => !s)}>child-toggle</button>
      {show && <div data-testid="target" ref={setEl}>target</div>}
    </>
  );
}

function Owner() {
  const [el, setEl] = useState<HTMLDivElement | null>(null);
  const hovered = useHover(el);
  return (
    <>
      <Child setEl={setEl} />
      <span data-testid="h">{String(hovered)}</span>
    </>
  );
}

describe("useHover with an element", () => {
  it("tracks an element that a child component mounts with its own state", () => {
    const r = render(<Owner />);
    fireEvent.click(r.getByText("child-toggle"));
    fireEvent.mouseEnter(r.getByTestId("target"));
    expect(r.getByTestId("h").textContent).toBe("true");
    fireEvent.mouseLeave(r.getByTestId("target"));
    expect(r.getByTestId("h").textContent).toBe("false");
  });

  it("works again after the child unmounts and remounts the element", () => {
    const r = render(<Owner />);
    fireEvent.click(r.getByText("child-toggle"));
    fireEvent.click(r.getByText("child-toggle"));
    fireEvent.click(r.getByText("child-toggle"));
    fireEvent.mouseEnter(r.getByTestId("target"));
    expect(r.getByTestId("h").textContent).toBe("true");
  });

  it("null stays false; window and body events do not flip it", () => {
    function C() {
      const hovered = useHover(null as HTMLDivElement | null);
      return <span data-testid="h">{String(hovered)}</span>;
    }
    const r = render(<C />);
    fireEvent.mouseEnter(document.body);
    fireEvent.mouseOver(window);
    expect(r.getByTestId("h").textContent).toBe("false");
  });

  it("StrictMode: one transition per event", () => {
    const r = render(<StrictMode><Owner /></StrictMode>);
    fireEvent.click(r.getByText("child-toggle"));
    fireEvent.mouseEnter(r.getByTestId("target"));
    expect(r.getByTestId("h").textContent).toBe("true");
    fireEvent.mouseLeave(r.getByTestId("target"));
    expect(r.getByTestId("h").textContent).toBe("false");
  });
});
