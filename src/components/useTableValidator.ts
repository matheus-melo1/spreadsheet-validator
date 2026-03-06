import z, { ZodObject, ZodRawShape } from "zod";
import { ErrorLog } from "../types/errorLog.type";
import { ErrorCode } from "../types/enum/errorCode.enum";
import { useEffect, useMemo, useState } from "react";
import { createWorker } from "../worker/createWorker";

export interface ITableValidator<T extends ZodRawShape> {
  data: any[];
  headers: string[];
  schema?: ZodObject<T>;
  errorIssuesLog?: (error: ErrorLog[] | undefined) => void;
}

export const useTableValidator = <T extends ZodRawShape>(
  props: ITableValidator<T>,
) => {
  const { data, headers, schema, errorIssuesLog } = props;
  const [errorIssuesState, setErrorIssuesState] = useState<
    ErrorLog[] | undefined
  >(undefined);

  useEffect(() => {
    if (!schema) return;
    if (!window.Worker) {
      console.log("Worker not supported");
      return;
    }

    const worker = createWorker();
    const schemaTOJSON = JSON.stringify(z.toJSONSchema(schema));

    worker.postMessage({
      schema: schemaTOJSON,
      data,
    });

    worker.onmessage = (event) => {
      const _validation = event.data;
      console.log("_validation", _validation);
      console.log("_validation", _validation?.error?.stack);
      // setErrorIssuesState(_validation.error?.issues ?? []);
    };

    worker.onerror = (event) => {
      console.log("worker.onerror", event);
    };

    return () => worker.terminate();
  }, [data, schema]);

  console.log("errorIssuesState", errorIssuesState);

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

  const validationIssuesFormatted = (errorIssuesState ?? []).map((issue) => {
    return {
      ...issue,
      column: issue.path[1],
      rowIndex: issue.path[0],
    };
  });

  const errorIssues = [...validationIssuesFormatted, ...isColumnNotExists];

  const errorIssueMatch = (rowNum: number) =>
    errorIssues?.some((issue) => issue?.rowIndex === rowNum);

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

  const errorMap = useMemo(() => {
    const map = new Map<number, Map<string, ErrorLog>>();
    errorIssues.forEach((err) => {
      const rowIdx = err.rowIndex;
      if (rowIdx == null || typeof rowIdx !== "number") return;
      if (!map.has(rowIdx)) map.set(rowIdx, new Map());
      map.get(rowIdx)!.set(String(err.column), err as ErrorLog);
    });
    return map;
  }, [errorIssues]);

  const onSetErrorIssuesLog = () => {
    errorIssuesLog?.(errorIssues as ErrorLog[]);
  };

  return {
    dataFiltered,
    dataError,
    onSetErrorIssuesLog,
    errorIssues,
    errorMap,
  };
};
