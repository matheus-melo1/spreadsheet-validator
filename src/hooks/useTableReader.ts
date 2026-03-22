import { useCallback, useEffect, useState } from "react";
import * as XLSX from "xlsx";
import z, { ZodISODate, ZodISODateTime, type ZodRawShape } from "zod";
import { formatDate } from "../utils/formatDate";
import { SpreadSheetData } from "../types/spreadSheetData.type";
import { useTableValidator } from "./useTableValidator";
import { TableReaderProps } from "../components/TableReader";

export const useTableReader = <T extends ZodRawShape>(
  props: TableReaderProps<T>,
) => {
  const { file, schema, errorIssuesLog, onTableData } = props;

  const [data, setData] = useState<SpreadSheetData[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const {
    dataFiltered,
    dataError,
    onSetErrorIssuesLog,
    errorIssues,
    errorMap,
  } = useTableValidator({ data, headers, schema, errorIssuesLog, file });

  const isDateReturn = (value: number) => {
    const jsDate = XLSX.SSF.parse_date_code(value);

    return new Date(jsDate.y, jsDate.m - 1, jsDate.d);
  };

  const renderValue = useCallback(
    (val: string | number | undefined, header: string, type: "visual" | "data") => {
      const field = schema?.shape[header];

      if (field instanceof ZodISODate || field instanceof ZodISODateTime) {
        if (type === "visual") {
          return typeof val === "number"
            ? formatDate(isDateReturn(val), "DD/MM/YYYY")
            : String(val ?? "");
        }

        const date = isDateReturn(val as number);
        if (field instanceof ZodISODate) {
          return date.toISOString().split("T")[0];
        }
        return formatDate(new Date(date.toISOString()), "DD/MM/YYYY");
      }

      return val ?? "";
    },
    [schema],
  );

  const archiveToJSON = async (sheet: XLSX.WorkSheet) => {
    return XLSX.utils.sheet_to_json<SpreadSheetData>(sheet)
  }

  console.log(isLoading)

  const onProcessingFile = () => {
    if (!file) return;

    const reader = new FileReader();
    setIsLoading(true)
    reader.onload = async (event) => {
      const binaryStr = event.target?.result;
      const workbook = XLSX.read(binaryStr, { type: "binary" });

      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];

      const jsonData = await archiveToJSON(firstSheet);
      const headers = Object.keys(jsonData[0]);

      const jsonForm = jsonData.map((row, index) => {
        const mappedRow = { ...row, __rowNum__: index } as SpreadSheetData & T;

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
        setData(jsonForm);
        onTableData?.(jsonForm);
      }

      setIsLoading(false)
    };

    reader.readAsBinaryString(file);
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
    renderValue,
    errorMap,
    isLoading
  };
};
