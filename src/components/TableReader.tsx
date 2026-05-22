import { useMemo } from "react";
import styles from "../styles/TableReader.module.css";
import { ZodObject, ZodRawShape } from "zod";
import { ErrorLog } from "../types/errorLog.type";
import { StyleTable } from "../types/styleTable.type";
import { TableBody } from "./TableBody";
import { useTableReader } from "../hooks/useTableReader";
import typeFiles from "../utils/typeFiles";
import { RowItemVisibility as RowItemVisibility } from "../types/enum/rowItemVisibility";
import { SpreadSheetData } from "../types/spreadSheetData.type";

export interface TableReaderProps<T extends ZodRawShape> {
  file: File | null;
  schema?: ZodObject<T>;
  errorIssuesLog?: (error: ErrorLog[] | undefined) => void;
  columnInfo?: {
    name: keyof T;
    message: string;
  }[];
  styleTable?: StyleTable;
  onTableData?: (data: SpreadSheetData[]) => void;
  rowHeight?: number;
  overscan?: number;
  containerHeight?: number;
  loadingComponent?: React.ReactNode;
  rowItemVisibility?: RowItemVisibility;
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
    loadingComponent,
    rowItemVisibility: rowShowType = RowItemVisibility.All,
  } = props;

  const { data, headers, dataError, errorMap, renderValue, isLoading } =
    useTableReader(props);

  const schemaKeys = useMemo(
    () => new Set(schema ? Object.keys(schema.shape) : []),
    [schema],
  );

  const rowsShowType = {
    [RowItemVisibility.All]: [...dataError, ...data],
    [RowItemVisibility.Error]: dataError,
    [RowItemVisibility.Success]: data,
  };

  const allRows = useMemo(
    () => rowsShowType[rowShowType],
    [dataError, data, rowShowType],
  );

  if (file === null) {
    return <p style={{ color: "black" }}>Select a file</p>;
  }

  if (!typeFiles.includes(file.type)) {
    return (
      <p style={{ color: "black" }}>
        Invalid file type, only supports xlsx and csv
      </p>
    );
  }

  if (loadingComponent && isLoading) {
    return loadingComponent;
  }

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
        rowShowType={rowShowType}
      />
    </div>
  );
}
