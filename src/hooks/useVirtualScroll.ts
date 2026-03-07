import { useState, useCallback, useRef, useLayoutEffect, type RefObject, type CSSProperties } from "react";

export interface VirtualRange {
  startIndex: number;
  endIndex: number;
  topSpacerHeight: number;
  bottomSpacerHeight: number;
}

interface UseVirtualScrollOptions {
  totalItems: number;
  itemHeight: number;
  containerRef: RefObject<HTMLDivElement | null>;
  overscan?: number;
}

interface UseVirtualScrollReturn {
  range: VirtualRange;
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

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    totalItems - 1,
    Math.floor((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const topSpacerHeight = startIndex * itemHeight;
  const bottomSpacerHeight = Math.max(0, (totalItems - endIndex - 1) * itemHeight);

  const containerProps = {
    onScroll: handleScroll,
    style: {
      overflow: "auto" as const,
      position: "relative" as const,
    },
  };

  return {
    range: { startIndex, endIndex, topSpacerHeight, bottomSpacerHeight },
    containerProps,
  };
};
