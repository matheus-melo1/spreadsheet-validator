import { memo, type CSSProperties } from "react";
import styles from "./TableReader.module.css";
import type { ErrorLog } from "../types/errorLog.type";
import type { SpreadSheetData } from "../types/spreadSheetData.type";
import type { StyleTable } from "../types/styleTable.type";

interface TableRowProps {
  row: SpreadSheetData;
  headers: string[];
  rowErrors?: Map<string, ErrorLog>;
  isErrorRow: boolean;
  style: CSSProperties;
  styleTable?: StyleTable;
  renderValue: (
    val: string | number | undefined,
    header: string,
    type: "visual" | "data"
  ) => string | number | Date;
}

export const TableRow = memo(function TableRow({
  row,
  headers,
  rowErrors,
  isErrorRow,
  style,
  styleTable,
  renderValue,
}: TableRowProps) {
  return (
    <tr
      className={styles.tr}
      style={{
        ...style,
        display: "flex",
        position: "absolute",
        width: "100%",
      }}
    >
      <td
        className={styles.tdIndex}
        style={{
          minWidth: "64px",
          color: isErrorRow ? "red" : styleTable?.textColor || "",
          backgroundColor: styleTable?.backgroundColor || "",
          border: styleTable?.borderColor
            ? `1px solid ${styleTable.borderColor}`
            : "",
        }}
      >
        {Number(row.__rowNum__) + 1}
      </td>
      {headers.map((header) => {
        const error = rowErrors?.get(header);
        return (
          <td
            key={header}
            className={`${styles.td} ${error ? styles.cellError : ""}`}
            title={error?.message || undefined}
            style={{
              flex: 1,
              minWidth: "12rem",
              padding: "0.75rem 1rem",
              fontSize: "0.875rem",
              color: styleTable?.textColor || "",
              border: styleTable?.borderColor
                ? `1px solid ${styleTable.borderColor}`
                : "",
              backgroundColor: error ? "rgba(230, 37, 23, 0.3)" : "",
            }}
          >
            {row[header] != null
              ? String(renderValue(row[header], header, "visual"))
              : ""}
          </td>
        );
      })}
    </tr>
  );
});
