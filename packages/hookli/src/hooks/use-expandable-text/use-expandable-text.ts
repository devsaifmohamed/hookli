import {
  useCallback,
  useEffect,
  useState,
  type CSSProperties,
  type RefCallback,
} from "react";

/**
 * Options accepted by {@link useExpandableText}. Provide `maxChars`, `maxLines`,
 * or both — whichever limit clips first wins.
 */
export interface UseExpandableTextOptions {
  /**
   * Maximum characters shown while collapsed. Pure string logic, so it works on
   * the server and yields a genuinely shortened string (trimmed to a word
   * boundary). Omit for no character cap.
   */
  maxChars?: number;
  /**
   * Maximum lines shown while collapsed. Applied as a CSS line-clamp via
   * {@link UseExpandableTextResult.clampStyle} and measured in the DOM, so it is
   * responsive (re-clips as the container narrows). Omit for no line cap.
   */
  maxLines?: number;
  /** Appended to character-truncated text. Defaults to `"…"`. */
  ellipsis?: string;
  /** Whether the text starts expanded. Defaults to `false`. */
  defaultExpanded?: boolean;
}

/**
 * The value returned by {@link useExpandableText}.
 */
export interface UseExpandableTextResult<T extends HTMLElement = HTMLElement> {
  /**
   * The text to render — character-capped when collapsed and `maxChars` is set,
   * otherwise the full text.
   */
  text: string;
  /** Whether the full text is currently shown. */
  isExpanded: boolean;
  /**
   * `true` when either limit actually clips the text. Use it to hide the toggle
   * when the text fits and no control is needed.
   */
  isTruncated: boolean;
  /** Flip between expanded and collapsed. */
  toggle: () => void;
  /** Show the full text. */
  expand: () => void;
  /** Collapse back to the limit. */
  collapse: () => void;
  /**
   * Attach to the text element. Required for the `maxLines` clamp and its
   * overflow measurement; harmless when only `maxChars` is used.
   */
  ref: RefCallback<T>;
  /**
   * Inline style applying the CSS line-clamp while collapsed and `maxLines` is
   * set (empty otherwise). Spread onto the text element.
   */
  clampStyle: CSSProperties;
}

/** Cut `text` to at most `maxChars`, backing off to the last word boundary. */
const truncateChars = (
  text: string,
  maxChars: number,
  ellipsis: string,
): string => {
  if (text.length <= maxChars) return text;
  const slice = text.slice(0, maxChars);
  const lastSpace = slice.lastIndexOf(" ");
  const cut = lastSpace > 0 ? slice.slice(0, lastSpace) : slice;
  return cut.trimEnd() + ellipsis;
};

/**
 * Collapse long text behind a "show more / less" toggle, capping it by a
 * **character** budget, a **line** budget, or both — whichever clips first wins.
 *
 * The two limits cover each other's blind spots. `maxChars` is pure string
 * logic: SSR-safe and it produces a genuinely shortened string. `maxLines` can
 * only be resolved in the DOM, so it is applied as a CSS line-clamp and measured
 * with a `ResizeObserver`, making it responsive to container width. With both
 * set, the string is capped to `maxChars` *and* the element is clamped to
 * `maxLines`, and `isTruncated` is `true` if either would clip.
 *
 * Measurement runs inside an effect and the observer is disconnected on cleanup,
 * so the hook is SSR-safe and leaks nothing.
 *
 * @param text - The full text to (maybe) collapse.
 * @param options - Character and/or line budgets and display options.
 * @returns The text to render plus `{ isExpanded, isTruncated, toggle, expand, collapse, ref, clampStyle }`.
 *
 * @example
 * ```tsx
 * const { text, isTruncated, isExpanded, toggle, ref, clampStyle } =
 *   useExpandableText(review.body, { maxChars: 180, maxLines: 3 });
 *
 * return (
 *   <>
 *     <p ref={ref} style={clampStyle}>{text}</p>
 *     {isTruncated && (
 *       <button onClick={toggle}>{isExpanded ? "Show less" : "Show more"}</button>
 *     )}
 *   </>
 * );
 * ```
 */
export const useExpandableText = <T extends HTMLElement = HTMLElement>(
  text: string,
  options: UseExpandableTextOptions = {},
): UseExpandableTextResult<T> => {
  const { maxChars, maxLines, ellipsis = "…", defaultExpanded = false } = options;

  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [node, setNode] = useState<T | null>(null);
  const [lineOverflow, setLineOverflow] = useState(false);

  const charTruncated = maxChars !== undefined && text.length > maxChars;
  const collapsedText = charTruncated
    ? truncateChars(text, maxChars, ellipsis)
    : text;
  const displayText = isExpanded ? text : collapsedText;

  const ref = useCallback<RefCallback<T>>((el) => setNode(el), []);

  // Measure whether the full text overflows `maxLines`. `scrollHeight` reflects
  // the full content height regardless of the clamp, so the read is accurate in
  // both states — except when the char cap has already shortened the string, in
  // which case `charTruncated` alone drives `isTruncated`.
  useEffect(() => {
    if (!node || maxLines === undefined) {
      setLineOverflow(false);
      return;
    }
    const measure = () => {
      const style = window.getComputedStyle(node);
      let lineHeight = Number.parseFloat(style.lineHeight);
      if (!Number.isFinite(lineHeight)) {
        lineHeight = Number.parseFloat(style.fontSize) * 1.2;
      }
      const padding =
        Number.parseFloat(style.paddingTop) +
        Number.parseFloat(style.paddingBottom);
      const maxHeight = lineHeight * maxLines + (padding || 0);
      setLineOverflow(node.scrollHeight > maxHeight + 1);
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [node, maxLines, text, isExpanded]);

  const toggle = useCallback(() => setIsExpanded((value) => !value), []);
  const expand = useCallback(() => setIsExpanded(true), []);
  const collapse = useCallback(() => setIsExpanded(false), []);

  const clampStyle: CSSProperties =
    !isExpanded && maxLines !== undefined
      ? {
          display: "-webkit-box",
          WebkitBoxOrient: "vertical",
          WebkitLineClamp: maxLines,
          overflow: "hidden",
        }
      : {};

  return {
    text: displayText,
    isExpanded,
    isTruncated: charTruncated || lineOverflow,
    toggle,
    expand,
    collapse,
    ref,
    clampStyle,
  };
};
