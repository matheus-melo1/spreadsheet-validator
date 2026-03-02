import { useRef } from "react";
import styles from "./TableReader.module.css";
import { useVirtualScroll, type VirtualItem } from "./useVirtualScroll";
import { TableRow } from "./TableRow";
import type { ErrorLog } from "../types/errorLog.type";
import type { SpreadSheetData } from "../types/spreadSheetData.type";
import type { StyleTable } from "../types/styleTable.type";

interface TableBodyProps {
  allRows: SpreadSheetData[];
  errorRowCount: number;
  headers: string[];
  errorMap: Map<number, Map<string, ErrorLog>>;
  styleTable?: StyleTable;
  rowHeight: number;
  overscan: number;
  containerHeight: number;
  renderValue: (
    val: string | number | undefined,
    header: string,
    type: "visual" | "data"
  ) => string | number | Date;
}

export function TableBody({
  allRows,
  errorRowCount,
  headers,
  errorMap,
  styleTable,
  rowHeight,
  overscan,
  containerHeight,
  renderValue,
}: TableBodyProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { virtualItems, totalHeight, containerProps } = useVirtualScroll({
    totalItems: allRows.length,
    itemHeight: rowHeight,
    containerRef,
    overscan,
  });

  return (
    <div
      ref={containerRef}
      {...containerProps}
      style={{
        ...containerProps.style,
        height: containerHeight,
      }}
    >
      <table style={{ display: "grid" }}>
        <tbody
          className={styles.tbody}
          style={{
            display: "grid",
            height: totalHeight,
            position: "relative",
            backgroundColor: styleTable?.backgroundColor || "",
            fontFamily: styleTable?.fontFamilyTable || "",
          }}
        >
          {virtualItems.map((virtualItem: VirtualItem) => {
            const row = allRows[virtualItem.index];
            if (!row) return null;
            const isErrorRow = virtualItem.index < errorRowCount;
            const rowErrors = errorMap.get(row.__rowNum__);

            return (
              <TableRow
                key={row.__rowNum__}
                row={row}
                headers={headers}
                rowErrors={rowErrors}
                isErrorRow={isErrorRow}
                style={{ transform: `translateY(${virtualItem.start}px)` }}
                styleTable={styleTable}
                renderValue={renderValue}
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
