import { useMemo } from "react";
import styles from "./TableReader.module.css";
import { useTableReader } from "./useTableReader";
import { ZodObject, ZodRawShape } from "zod";
import { ErrorLog } from "../types/errorLog.type";
import { StyleTable } from "../types/styleTable.type";
import { TableBody } from "./TableBody";

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
  rowHeight?: number;
  overscan?: number;
  containerHeight?: number;
}

export function TableReader<T extends ZodRawShape>(props: TableReaderProps<T>) {
  const {
    file,
    schema,
    columnInfo,
    styleTable,
    rowHeight = 36,
    overscan = 5,
    containerHeight = 600,
  } = props;

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
        Arquivo invalido, selecione um arquivo de tipo xlsx ou csv
      </p>
    );
  }

  const { data, headers, dataError, errorMap, renderValue } =
    useTableReader(props);

  const schemaKeys = useMemo(
    () => new Set(schema ? Object.keys(schema.shape) : []),
    [schema],
  );

  const allRows = useMemo(() => [...dataError, ...data], [dataError, data]);

  return (
    <div
      className={styles.container}
      style={{
        border: styleTable?.tableBorderColor
          ? `1px solid ${styleTable.tableBorderColor}`
          : "",
        borderRadius: styleTable?.tableBorderRadius || "",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <TableBody
        allRows={allRows}
        errorRowCount={dataError.length}
        headers={headers}
        errorMap={errorMap}
        schemaKeys={schemaKeys}
        columnInfo={columnInfo as { name: string; message: string }[]}
        styleTable={styleTable}
        rowHeight={rowHeight}
        overscan={overscan}
        containerHeight={containerHeight}
        renderValue={renderValue}
      />
    </div>
  );
}
