import { useState, useCallback, useRef, useLayoutEffect, type RefObject, type CSSProperties } from "react";

export interface VirtualItem {
  index: number;
  start: number;
  size: number;
}

interface UseVirtualScrollOptions {
  totalItems: number;
  itemHeight: number;
  containerRef: RefObject<HTMLDivElement | null>;
  overscan?: number;
}

interface UseVirtualScrollReturn {
  virtualItems: VirtualItem[];
  totalHeight: number;
  containerProps: {
    onScroll: () => void;
    style: CSSProperties;
  };
}

export const useVirtualScroll = ({
  totalItems,
  itemHeight,
  containerRef,
  overscan = 5,
}: UseVirtualScrollOptions): UseVirtualScrollReturn => {
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const rafId = useRef<number | null>(null);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const ro = new ResizeObserver(() => {
      setContainerHeight(el.clientHeight);
    });

    ro.observe(el);
    setContainerHeight(el.clientHeight);

    return () => ro.disconnect();
  }, [containerRef]);

  const handleScroll = useCallback(() => {
    if (rafId.current !== null) return;
    rafId.current = requestAnimationFrame(() => {
      const el = containerRef.current;
      if (el) {
        setScrollTop(el.scrollTop);
      }
      rafId.current = null;
    });
  }, [containerRef]);

  const totalHeight = totalItems * itemHeight;

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    totalItems - 1,
    Math.floor((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const virtualItems: VirtualItem[] = [];
  for (let i = startIndex; i <= endIndex; i++) {
    virtualItems.push({
      index: i,
      start: i * itemHeight,
      size: itemHeight,
    });
  }

  const containerProps = {
    onScroll: handleScroll,
    style: {
      overflow: "auto",
      position: "relative" as const,
      contain: "strict" as const,
      willChange: "transform" as const,
    },
  };

  return { virtualItems, totalHeight, containerProps };
};
