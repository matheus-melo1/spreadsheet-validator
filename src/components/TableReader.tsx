import { useMemo } from "react";
import styles from "./TableReader.module.css";
import { useTableReader } from "./useTableReader";
import { ZodObject, ZodRawShape } from "zod";
import { ErrorLog } from "../types/errorLog.type";
import InfoIcon from "./InfoIcon";
import { StyleTable } from "../types/styleTable.type";
// import { SpreadSheetData } from "../types/spreadSheetData.type";

export interface TableReaderProps<T extends ZodRawShape> {
  file: File | null;
  schema?: ZodObject<T>;
  errorIssuesLog?: (error: ErrorLog[] | undefined) => void;
  columnInfo?: {
    name: keyof T;
    message: string;
  }[];
  styleTable?: StyleTable;
  onTableData?: (data: T[]) => void;
}

export function TableReader<T extends ZodRawShape>(props: TableReaderProps<T>) {
  const { file, schema, columnInfo, styleTable } = props;

  const typeFiles = [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/csv",
    "xlsx",
    "csv",
  ];

  if (file === null) {
    return <p style={{ color: "black" }}>Selecione um arquivo, para exibir</p>;
  }

  if (!typeFiles.includes(file.type)) {
    return (
      <p style={{ color: "black" }}>
        Arquivo inválido, selecione um arquivo de tipo xlsx ou csv
      </p>
    );
  }

  const { data, headers, dataError, errorIssues, onCellChange, renderValue } =
    useTableReader(props);

  return (
    <div
      className={styles.container}
      style={{
        border: styleTable?.tableBorderColor
          ? `1px solid ${styleTable.tableBorderColor}`
          : "",
        borderRadius: styleTable?.tableBorderRadius || "",
      }}
    >
      <table className={styles.table}>
        {useMemo(
          () => (
            <thead
              className={styles.thead}
              style={{
                backgroundColor: styleTable?.headerColor || "",
                fontFamily: styleTable?.fontFamilyHeader || "",
              }}
            >
              <tr>
                <th className={styles.th}>#</th>
                {headers.map((header) => {
                  const isColumnNotExists = schema?.shape[header]
                    ? false
                    : true;
                  const isColumnSelected = columnInfo?.find(
                    (column) => column.name === header,
                  );

                  return (
                    <th
                      key={header}
                      className={styles.th}
                      style={{
                        backgroundColor: isColumnNotExists ? "#d9041a" : "",
                        borderLeft: styleTable?.borderColor
                          ? `1px solid ${styleTable?.borderColor}`
                          : "",
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
          ),
          [headers],
        )}
        {useMemo(
          () => (
            <tbody
              className={styles.tbody}
              style={{
                backgroundColor: styleTable?.backgroundColor || "",
                fontFamily: styleTable?.fontFamilyTable || "",
              }}
            >
              {dataError.map((row, rowIndex) => (
                <tr key={row.__rowNum__} className={styles.tr} style={{}}>
                  <td
                    style={{
                      color: "red",
                      backgroundColor: styleTable?.backgroundColor || "",
                      border: styleTable?.borderColor
                        ? `1px solid ${styleTable?.borderColor}`
                        : "",
                    }}
                    className={styles.tdIndex}
                  >
                    {Number(row.__rowNum__) + 1}
                  </td>

                  {headers.map((header) => {
                    const errorHeader = errorIssues?.find(
                      (issue) =>
                        issue.column === header &&
                        issue.rowIndex === row.__rowNum__,
                    );

                    return (
                      <td
                        key={`${rowIndex}-${header}`}
                        className={styles.td}
                        style={{
                          border: styleTable?.borderColor
                            ? `1px solid ${styleTable?.borderColor}`
                            : "",
                        }}
                      >
                        <input
                          type="text"
                          value={
                            row[header] != null
                              ? (renderValue(
                                  row[header],
                                  header,
                                  "visual",
                                ) as string)
                              : ""
                          }
                          onChange={(e) =>
                            onCellChange?.(rowIndex, header, e.target.value)
                          }
                          className={styles.input}
                          style={{
                            backgroundColor: !!errorHeader ? "#e625174d" : "",
                            border: !!errorHeader ? "1px solid red" : "",
                            color: styleTable?.textColor || "",
                          }}
                        />
                        {/* <p style={{ color: "red" }}>{errorHeader?.message}</p> */}
                      </td>
                    );
                  })}
                </tr>
              ))}
              {data.map((row, rowIndex) => (
                <tr key={row.__rowNum__} className={styles.tr}>
                  <td
                    className={styles.tdIndex}
                    style={{
                      backgroundColor: styleTable?.backgroundColor || "",
                      color: styleTable?.textColor || "",
                      border: styleTable?.borderColor
                        ? `1px solid ${styleTable?.borderColor}`
                        : "",
                    }}
                  >
                    {Number(row.__rowNum__) + 1}
                  </td>

                  {headers.map((header) => {
                    return (
                      <td
                        key={`${rowIndex}-${header}`}
                        className={styles.td}
                        style={{
                          border: styleTable?.borderColor
                            ? `1px solid ${styleTable?.borderColor}`
                            : "",
                        }}
                      >
                        <input
                          type="text"
                          value={
                            row[header] != null
                              ? (renderValue(
                                  row[header],
                                  header,
                                  "visual",
                                ) as string)
                              : ""
                          }
                          onChange={(e) =>
                            onCellChange?.(rowIndex, header, e.target.value)
                          }
                          className={styles.input}
                          style={{
                            color: styleTable?.textColor || "",
                          }}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          ),
          [data, dataError],
        )}
      </table>
    </div>
  );
}
