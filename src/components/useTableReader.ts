import React, { useEffect } from "react";
import * as XLSX from "xlsx";
import { ZodDate, type ZodRawShape, z } from "zod";
import { TableReaderProps } from "./TableReader";
import { formatDate } from "../utils/formatDate";
import { useTableValidator } from "./useTableValidator";

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

  const { dataFiltered, dataError, onSetErrorIssuesLog, errorIssues } =
    useTableValidator({ data, headers, schema, errorIssuesLog });

  const isDateReturn = (value: number) => {
    const jsDate = XLSX.SSF.parse_date_code(value);

    return new Date(jsDate.y, jsDate.m - 1, jsDate.d);
  };

  const renderValue = (
    val: string | number | undefined,
    header: string,
    type: "visual" | "data",
  ) => {
    const field = schema?.shape[header];

    if (field instanceof ZodDate) {
      if (type === "visual") {
        return typeof val === "number"
          ? formatDate(isDateReturn(val), "DD/MM/YYYY")
          : String(val ?? "");
      }

      return isDateReturn(val as number);
    }

    return val ?? "";
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
        const mappedRow = { ...row, __rowNum__: index } as ExcelData;

        for (const header of headers) {
          const value = row[header];
          mappedRow[header] = renderValue(value, header, "data") as
            | string
            | number;
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
    renderValue,
  };
};
