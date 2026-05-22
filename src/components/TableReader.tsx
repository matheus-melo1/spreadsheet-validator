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

/**
 * Props for rendering and validating spreadsheet data in a virtualized table.
 */
export interface TableReaderProps<T extends ZodRawShape> {
  /** Spreadsheet file to read. When `null`, the component prompts the user to select a file. */
  file: File | null;
  /** Optional Zod schema used to validate rows and format typed values. */
  schema?: ZodObject<T>;
  /** Callback invoked with the collected validation errors after processing the file. */
  errorIssuesLog?: (error: ErrorLog[] | undefined) => void;
  /** Optional per-column helper messages used when rendering table metadata. */
  columnInfo?: {
    name: keyof T;
    message: string;
  }[];
  /** Visual customization for the table container and cells. */
  styleTable?: StyleTable;
  /** Callback invoked with the parsed spreadsheet rows after file processing completes. */
  onTableData?: (data: SpreadSheetData[]) => void;
  /** Fixed pixel height used by the virtualized rows. */
  rowHeight?: number;
  /** Extra rows rendered above and below the viewport for smoother scrolling. */
  overscan?: number;
  /** Visible table viewport height in pixels. */
  containerHeight?: number;
  /** Optional component rendered while the file is being processed. */
  loadingComponent?: React.ReactNode;
  /**
   * Controls which rows are rendered in the table.
   *
   * - `RowItemVisibility.All`: shows all rows
   * - `RowItemVisibility.Error`: shows only rows with validation errors
   * - `RowItemVisibility.Success`: shows only valid rows
   *
   * @default RowItemVisibility.All
   */
  rowItemVisibility?: RowItemVisibility;
}

/**
 * Reads spreadsheet files, validates row data, and renders the result in a virtualized table.
 */
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

  /** Precomputed row groups keyed by visibility mode. */
  const rowsShowType = {
    [RowItemVisibility.All]: [...dataError, ...data],
    [RowItemVisibility.Error]: dataError,
    [RowItemVisibility.Success]: data,
  };

  /** Final row set rendered by the table according to the selected visibility mode. */
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
        rowItemVisibility={rowShowType}
      />
    </div>
  );
}
