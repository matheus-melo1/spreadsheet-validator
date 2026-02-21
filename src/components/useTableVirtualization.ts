import { useLayoutEffect, useMemo, useRef, useState } from "react";

interface useTableVirtualizationProps<T> {
  height: number;
  rowHeight: number;
  overscan: number;
  data: T[];
  headers: string[];
}

export const useTableVirtualization = <T>(
  methods: useTableVirtualizationProps<T>,
) => {
  const { data, headers, height, rowHeight, overscan } = methods;

  const gridVars = { ["--cols" as any]: headers.length };
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [scrollTop, setScrollTop] = useState(0);

  const [measuredHeight, setMeasuredHeight] = useState<number>(height);

  useLayoutEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const ro = new ResizeObserver(() => {
      setMeasuredHeight(el.clientHeight || height);
    });

    ro.observe(el);
    setMeasuredHeight(el.clientHeight || height);

    return () => ro.disconnect();
  }, [height]);

  const totalRows = data.length;
  const totalHeight = totalRows * rowHeight;

  const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
  const endIndex = Math.min(
    totalRows - 1,
    Math.floor((scrollTop + measuredHeight) / rowHeight) + overscan,
  );

  const visibleRows = useMemo(() => {
    if (totalRows === 0) return [];
    return data.slice(startIndex, endIndex + 1);
  }, [data, startIndex, endIndex, totalRows]);

  const offsetY = startIndex * rowHeight;

  return {
    gridVars,
    viewportRef,
    scrollTop,
    setScrollTop,
    totalHeight,
    visibleRows,
    offsetY,
    startIndex,
  };
};
