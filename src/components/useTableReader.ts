import React, { useEffect, useMemo } from "react";
import * as XLSX from "xlsx";
import { ZodRawShape, z } from "zod";
import { ErrorLog } from "../types/errorLog.type";
import { TableReaderProps } from "./TableReader";
import { ErrorCode } from "../types/enum/errorCode.enum";

interface ExcelData {
  [key: string]: string | number;
  __rowNum__: number;
}

export const useTableReader = <T extends ZodRawShape>(
  props: TableReaderProps<T>,
) => {
  const { file, schema, errorIssuesLog } = props;

  const [data, setData] = React.useState<ExcelData[]>([]);
  const [headers, setHeaders] = React.useState<string[]>([]);

  const onValidationSchema = () => {
    if (!schema) return;

    return z.array(z.object(schema.shape)).safeParse(data);
  };

  const validation = onValidationSchema();

  const isColumnNotExists = headers
    ?.map((header) => {
      const isHeaderExists = schema?.shape[header] ? true : false;

      if (isHeaderExists) return;

      return {
        code: ErrorCode.COLUMN_NOT_EXISTS,
        message: `column ${header} not exists in schema`,
        column: header,
        rowIndex: null,
        path: [null, header],
      };
    })
    .filter((issue) => issue !== undefined);

  const validationIssuesFormatted = (validation?.error?.issues ?? []).map(
    (issue) => {
      return {
        ...issue,
        column: issue.path[1],
        rowIndex: issue.path[0],
      };
    },
  );

  const errorIssues = [...validationIssuesFormatted, ...isColumnNotExists];

  const errorIssueMatch = (rowNum: number) =>
    errorIssues?.some((issue) => issue?.path[0] === rowNum);

  const dataError = useMemo(
    () =>
      errorIssues && errorIssues.length > 0
        ? data.filter((row) => errorIssueMatch(row.__rowNum__))
        : [],
    [errorIssues, data],
  );

  const dataFiltered = useMemo(
    () =>
      errorIssues && errorIssues.length > 0
        ? data.filter((row) => !errorIssueMatch(row.__rowNum__))
        : data,
    [errorIssues, data],
  );

  const onSetErrorIssuesLog = () => {
    errorIssuesLog?.(errorIssues as ErrorLog[]);
  };

  const isDateReturn = (value: number) => {
    const jsDate = XLSX.SSF.parse_date_code(value);

    return new Date(jsDate.y, jsDate.m - 1, jsDate.d);
  };

  const actionValue = (
    val: string | number | undefined,
    header: string,
    isDate: boolean,
  ) => {
    headers;
    if (isDate) {
      return typeof val === "number" ? isDateReturn(val) : val;
    }

    return val;
  };

  const onProcessingFile = () => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const binaryStr = event.target?.result;
      const workbook = XLSX.read(binaryStr, { type: "binary" });

      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];

      const jsonData = XLSX.utils.sheet_to_json<ExcelData>(firstSheet);
      const headers = Object.keys(jsonData[0]);

      const jsonForm = jsonData.map((row, index) => {
        const mappedRow = { ...row, __rowNum__: index } as ExcelData & {
          __rowNum__: number;
        };

        for (const header of headers) {
          const value = row[header];
          const isDate = header.includes("Data");
          mappedRow[header] = actionValue(value, header, isDate);
        }

        return mappedRow;
      });

      if (jsonData.length > 0) {
        setHeaders(Object.keys(jsonData[0]));
        setData(jsonForm as ExcelData[]);
      }
    };

    reader.readAsBinaryString(file);
  };

  const onCellChange = (rowIndex: number, header: string, value: string) => {
    const row = data.find((row) => row.__rowNum__ === rowIndex);

    if (!row) return;

    row[header] = value;

    setData([...data]);
  };

  useEffect(() => {
    onProcessingFile();
  }, [file]);

  useEffect(() => {
    onSetErrorIssuesLog();
  }, [errorIssues]);

  return {
    data: dataFiltered,
    headers,
    onProcessingFile,
    dataError,
    errorIssues,
    onCellChange,
  };
};
