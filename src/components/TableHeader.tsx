import { memo } from "react";
import styles from "../styles/TableReader.module.css";
import InfoIcon from "./InfoIcon";
import type { StyleTable } from "../types/styleTable.type";

interface ColumnInfoItem {
  name: string;
  message: string;
}

interface TableHeaderProps {
  headers: string[];
  schemaKeys: Set<string>;
  columnInfo?: ColumnInfoItem[];
  styleTable?: StyleTable;
}

export const TableHeader = memo(function TableHeader({
  headers,
  schemaKeys,
  columnInfo,
  styleTable,
}: TableHeaderProps) {
  return (
    <thead
      className={styles.thead}
      style={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        backgroundColor: styleTable?.headerColor || "",
        fontFamily: styleTable?.fontFamilyHeader || "",
      }}
    >
      <tr>
        <th className={styles.th} style={{ minWidth: "64px", padding: styleTable?.paddingHeader || undefined }}>
          #
        </th>
        {headers.map((header) => {
          const isColumnNotExists = !schemaKeys.has(header);
          const isColumnSelected = columnInfo?.find(
            (column) => column.name === header
          );

          return (
            <th
              key={header}
              className={styles.th}
              style={{
                minWidth: "12rem",
                backgroundColor: isColumnNotExists ? "#d9041a" : "",
                borderLeft: styleTable?.borderColor
                  ? `1px solid ${styleTable.borderColor}`
                  : "",
                padding: styleTable?.paddingHeader || undefined,
              }}
            >
              <div className={styles.th_content}>
                {header}
                {isColumnSelected && (
                  <div
                    className={styles.tooltip}
                    data-tooltip={isColumnSelected.message}
                  >
                    <InfoIcon />
                  </div>
                )}
              </div>
            </th>
          );
        })}
      </tr>
    </thead>
  );
});
