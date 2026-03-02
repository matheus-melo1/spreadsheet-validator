import { useRef } from "react";
import styles from "./TableReader.module.css";
import { useVirtualScroll, type VirtualItem } from "./useVirtualScroll";
import { TableRow } from "./TableRow";
import { TableHeader } from "./TableHeader";
import type { ErrorLog } from "../types/errorLog.type";
import type { SpreadSheetData } from "../types/spreadSheetData.type";
import type { StyleTable } from "../types/styleTable.type";

interface TableBodyProps {
  allRows: SpreadSheetData[];
  errorRowCount: number;
  headers: string[];
  errorMap: Map<number, Map<string, ErrorLog>>;
  schemaKeys: Set<string>;
  columnInfo?: { name: string; message: string }[];
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
  schemaKeys,
  columnInfo,
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
        overflow: "auto",
      }}
    >
      <table
        className={styles.table}
        style={{ tableLayout: "fixed" }}
      >
        <colgroup>
          <col style={{ width: "64px" }} />
          {headers.map((header) => (
            <col key={header} style={{ width: "200px" }} />
          ))}
        </colgroup>
        <TableHeader
          headers={headers}
          schemaKeys={schemaKeys}
          columnInfo={columnInfo}
          styleTable={styleTable}
        />
        <tbody
          className={styles.tbody}
          style={{
            backgroundColor: styleTable?.backgroundColor || "",
            fontFamily: styleTable?.fontFamilyTable || "",
          }}
        >
          {/* Spacer row to create total scroll height */}
          <tr style={{ height: 0, visibility: "hidden", lineHeight: 0 }}>
            <td
              colSpan={headers.length + 1}
              style={{ height: totalHeight, padding: 0, border: "none" }}
            />
          </tr>
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
                style={{
                  position: "absolute",
                  top: virtualItem.start,
                  height: rowHeight,
                  width: "100%",
                }}
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
