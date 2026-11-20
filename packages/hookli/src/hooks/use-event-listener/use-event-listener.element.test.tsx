import { StrictMode, useState } from "react";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, expectTypeOf, it, vi } from "vitest";
import { useEventListener } from "./use-event-listener";

afterEach(cleanup);

/* The element form: `const [el, setEl] = useState(null)` + `ref={setEl}`. The hook's
   component re-renders whenever the element changes, wherever it is mounted. */

function Child({ setEl }: { setEl: (el: HTMLDivElement | null) => void }) {
  const [show, setShow] = useState(false);
  return (
    <>
      <button onClick={() => setShow((s) => !s)}>child-toggle</button>
      {show && <div data-testid="target" ref={setEl}>target</div>}
    </>
  );
}

function Owner({ onClick }: { onClick: (e: MouseEvent) => void }) {
  const [el, setEl] = useState<HTMLDivElement | null>(null);
  useEventListener("click", onClick, el);
  return <Child setEl={setEl} />;
}

describe("useEventListener with an element", () => {
  it("follows an element that a child component mounts with its own state", () => {
    const seen: Array<EventTarget | null> = [];
    const onClick = vi.fn((e: MouseEvent) => seen.push(e.currentTarget));
    const r = render(<Owner onClick={onClick} />);
    fireEvent.click(r.getByText("child-toggle"));
    fireEvent.click(document.body);
    expect(onClick).not.toHaveBeenCalled();
    const target = r.getByTestId("target");
    fireEvent.click(target);
    expect(seen).toEqual([target]);
  });

  it("detaches when the child unmounts the element, and re-attaches when it comes back", () => {
    const seen: Array<EventTarget | null> = [];
    const onClick = vi.fn((e: MouseEvent) => seen.push(e.currentTarget));
    const r = render(<Owner onClick={onClick} />);
    fireEvent.click(r.getByText("child-toggle"));
    const first = r.getByTestId("target");
    fireEvent.click(first);
    fireEvent.click(r.getByText("child-toggle"));
    fireEvent.click(first);
    fireEvent.click(r.getByText("child-toggle"));
    const second = r.getByTestId("target");
    fireEvent.click(second);
    // One call per click on the mounted element; none for the toggle button or the removed element.
    expect(seen).toEqual([first, second]);
  });

  it("null attaches nothing, and never falls back to window", () => {
    const onClick = vi.fn();
    const add = vi.spyOn(window, "addEventListener");
    function C() {
      useEventListener("click", onClick, null as HTMLDivElement | null);
      return null;
    }
    render(<C />);
    fireEvent.click(document.body);
    fireEvent.click(window);
    expect(onClick).not.toHaveBeenCalled();
    expect(add.mock.calls.filter((c) => c[0] === "click")).toHaveLength(0);
    add.mockRestore();
  });

  it("moves to a new element when the value changes", () => {
    const onClick = vi.fn();
    const a = document.createElement("div");
    const b = document.createElement("div");
    function C({ el }: { el: HTMLDivElement }) {
      useEventListener("click", onClick, el);
      return null;
    }
    const r = render(<C el={a} />);
    r.rerender(<C el={b} />);
    a.dispatchEvent(new MouseEvent("click"));
    expect(onClick).not.toHaveBeenCalled();
    b.dispatchEvent(new MouseEvent("click"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("accepts document and a MediaQueryList directly", () => {
    const onKey = vi.fn();
    const onChange = vi.fn();
    const mql = {
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as MediaQueryList;
    function C() {
      useEventListener("keydown", onKey, document);
      useEventListener("change", onChange, mql);
      return null;
    }
    const r = render(<C />);
    fireEvent.keyDown(document);
    expect(onKey).toHaveBeenCalledTimes(1);
    expect(mql.addEventListener).toHaveBeenCalledWith("change", expect.any(Function), undefined);
    r.unmount();
    expect(mql.removeEventListener).toHaveBeenCalledWith("change", expect.any(Function), undefined);
  });

  it("StrictMode: one call per click; nothing after unmount", () => {
    const onClick = vi.fn();
    const r = render(<StrictMode><Owner onClick={onClick} /></StrictMode>);
    fireEvent.click(r.getByText("child-toggle"));
    const target = r.getByTestId("target");
    fireEvent.click(target);
    fireEvent.click(target);
    expect(onClick).toHaveBeenCalledTimes(2);
    r.unmount();
    fireEvent.click(target);
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it("types the event from the element's event map", () => {
    function C() {
      const [el] = useState<HTMLButtonElement | null>(null);
      useEventListener("click", (e) => expectTypeOf(e).toMatchTypeOf<MouseEvent>(), el);
      useEventListener("keydown", (e) => expectTypeOf(e).toMatchTypeOf<KeyboardEvent>(), document);
      // @ts-expect-error a string is not a target
      useEventListener("click", () => {}, "button");
      return null;
    }
    expect(() => render(<C />)).not.toThrow();
  });
});
