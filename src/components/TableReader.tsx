import { useMemo } from "react";
import styles from "./TableReader.module.css";
import { useTableReader } from "./useTableReader";
import { ZodObject, ZodRawShape } from "zod";
import { ErrorLog } from "../types/errorLog.type";
import InfoIcon from "./InfoIcon";

export interface TableReaderProps<T extends ZodRawShape> {
  file: File | null;
  schema?: ZodObject<T>;
  errorIssuesLog?: (error: ErrorLog[] | undefined) => void;
  columnInfo?: {
    name: keyof T;
    message: string;
  }[];
}

export function TableReader<T extends ZodRawShape>(props: TableReaderProps<T>) {
  const { file, schema, columnInfo } = props;

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
    <div className={styles.container}>
      <table className={styles.table}>
        {useMemo(
          () => (
            <thead className={styles.thead}>
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
                        backgroundColor: isColumnNotExists ? "#e62517" : "",
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
            <tbody className={styles.tbody}>
              {dataError.map((row, rowIndex) => (
                <tr key={row.__rowNum__} className={styles.tr}>
                  <td style={{ color: "red" }} className={styles.tdIndex}>
                    {Number(row.__rowNum__) + 1}
                  </td>

                  {headers.map((header) => {
                    const errorHeader = errorIssues?.find(
                      (issue) =>
                        issue.column === header &&
                        issue.rowIndex === row.__rowNum__,
                    );

                    return (
                      <td key={`${rowIndex}-${header}`} className={styles.td}>
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
                  <td className={styles.tdIndex}>
                    {Number(row.__rowNum__) + 1}
                  </td>

                  {headers.map((header) => {
                    return (
                      <td key={`${rowIndex}-${header}`} className={styles.td}>
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
