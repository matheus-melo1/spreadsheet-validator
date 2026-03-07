import { memo, type CSSProperties } from "react";
import styles from "../styles/TableReader.module.css";
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
    type: "visual" | "data",
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
    <tr className={styles.tr} style={style}>
      <td
        className={styles.tdIndex}
        style={{
          color: isErrorRow ? "red" : styleTable?.textColor || "",
          backgroundColor: styleTable?.backgroundColor || "",
          borderRight: styleTable?.borderColor
            ? `1px solid ${styleTable.borderColor}`
            : "",
          borderBottom: styleTable?.borderColor
            ? `1px solid ${styleTable.borderColor}`
            : "",
          padding: styleTable?.paddingCell || undefined,
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
              color: styleTable?.textColor || "",
              borderRight: styleTable?.borderColor
                ? `1px solid ${styleTable.borderColor}`
                : "",
              borderBottom: styleTable?.borderColor
                ? `1px solid ${styleTable.borderColor}`
                : "",
              backgroundColor: error ? "rgba(230, 37, 23, 0.3)" : "",
              padding: styleTable?.paddingCell || undefined,
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
