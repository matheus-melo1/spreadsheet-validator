import { useRef } from "react";
import styles from "./TableReader.module.css";
import { useVirtualScroll } from "./useVirtualScroll";
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
    type: "visual" | "data",
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

  const { range, containerProps } = useVirtualScroll({
    totalItems: allRows.length,
    itemHeight: rowHeight,
    containerRef,
    overscan,
  });

  const visibleRows = allRows.slice(range.startIndex, range.endIndex + 1);

  return (
    <div
      ref={containerRef}
      {...containerProps}
      style={{
        ...containerProps.style,
        height: containerHeight,
      }}
    >
      <table className={styles.table} style={{ tableLayout: "fixed" }}>
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
          {/* Top spacer - pushes visible rows to correct scroll position */}
          {range.topSpacerHeight > 0 && (
            <tr>
              <td
                colSpan={headers.length + 1}
                style={{ height: range.topSpacerHeight, padding: 0, border: "none" }}
              />
            </tr>
          )}
          {/* Visible rows - in normal table flow, aligned with header */}
          {visibleRows.map((row, i) => {
            const actualIndex = range.startIndex + i;
            const isErrorRow = actualIndex < errorRowCount;
            const rowErrors = errorMap.get(row.__rowNum__);

            return (
              <TableRow
                key={row.__rowNum__}
                row={row}
                headers={headers}
                rowErrors={rowErrors}
                isErrorRow={isErrorRow}
                style={{ height: rowHeight }}
                styleTable={styleTable}
                renderValue={renderValue}
              />
            );
          })}
          {/* Bottom spacer - maintains total scroll height */}
          {range.bottomSpacerHeight > 0 && (
            <tr>
              <td
                colSpan={headers.length + 1}
                style={{ height: range.bottomSpacerHeight, padding: 0, border: "none" }}
              />
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
