import { useEffect, useState } from "react";

type FetchMoreData = () => Promise<void>; // Function to fetch more data

/**
 * Triggers loading near the scroll end.
 *
 * @category dom
 * @keywords infinite scroll, load more, scroll to bottom, pagination on scroll, endless feed
 * @param fetchMoreData - Called when the window scroll comes within 500px of the document bottom.
 *   Must return a promise — the hook stays in the fetching state until it resolves.
 * @returns isFetching - True while a triggered fetchMoreData promise is pending; blocks
 *   re-triggering until it resolves.
 *
 * @example Usage
 * ```tsx
 * import { useCallback, useState } from "react";
 * import { useInfiniteScroll } from "hookli";
 *
 * const page = (start: number) =>
 *   Array.from({ length: 10 }, (_, i) => `Item ${start + i + 1}`);
 *
 * export function Demo() {
 *   const [items, setItems] = useState(() => page(0));
 *
 *   const fetchMoreData = useCallback(
 *     () =>
 *       new Promise<void>((resolve) => {
 *         setItems((prev) => [...prev, ...page(prev.length)]);
 *         resolve();
 *       }),
 *     [],
 *   );
 *
 *   const isFetching = useInfiniteScroll(fetchMoreData);
 *
 *   return (
 *     <div>
 *       <ul>
 *         {items.map((item) => (
 *           <li key={item}>{item}</li>
 *         ))}
 *       </ul>
 *       {isFetching && <p>Loading more…</p>}
 *     </div>
 *   );
 * }
 * ```
 */
export const useInfiniteScroll = (fetchMoreData: FetchMoreData): boolean => {
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isNearBottom =
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 500;
      if (isNearBottom && !isFetching) {
        setIsFetching(true);
        fetchMoreData().then(() => setIsFetching(false));
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [fetchMoreData, isFetching]);

  return isFetching;
};
