import z, { ZodObject, ZodRawShape } from "zod";
import { ErrorLog } from "../types/errorLog.type";
import { ErrorCode } from "../types/enum/errorCode.enum";
import { useEffect, useMemo, useState } from "react";
import { createWorker } from "../worker/createWorker";

export interface ITableValidator<T extends ZodRawShape> {
  data: any[];
  headers: string[];
  schema?: ZodObject<T>;
  file?: File | null;
  errorIssuesLog?: (error: ErrorLog[] | undefined) => void;
}

export const useTableValidator = <T extends ZodRawShape>(
  props: ITableValidator<T>,
) => {
  const { data, headers, schema, errorIssuesLog, file } = props;
  const [errorIssuesState, setErrorIssuesState] = useState<
    ErrorLog[] | undefined
  >(undefined);

  const isColumnNotExists = useMemo(() => {
    if (!headers || !schema?.shape) return [];
    return headers
      .map((header) => {
        if (schema.shape[header]) return undefined;
        return {
          code: ErrorCode.COLUMN_NOT_EXISTS,
          message: `column ${header} not exists in schema`,
          column: header,
          rowIndex: null,
          path: [null, header],
        };
      })
      .filter((issue) => issue !== undefined);
  }, [headers, schema]);

  const validationSchema = useMemo(() => {
    if (!schema?.shape || !headers.length) return undefined;
    const pickKeys: Record<string, true> = {};
    for (const header of headers) {
      if (schema.shape[header]) {
        pickKeys[header] = true;
      }
    }
    return Object.keys(pickKeys).length > 0
      ? schema.pick(pickKeys as any)
      : undefined;
  }, [schema, headers]);

  const dataFilt = useMemo(() => {
    if (!schema?.shape || !data.length) return [];
    const schemaKeys = Object.keys(schema.shape);
    return data.map((row) => {
      const picked: Record<string, unknown> = {};
      for (const key of schemaKeys) {
        if (key in row) {
          picked[key] = row[key];
        }
      }
      return picked;
    });
  }, [data, schema]);

  const { errorIssues, errorRowSet } = useMemo(() => {
    const formatted = (errorIssuesState ?? []).map((issue) => ({
      ...issue,
      column: issue.path[1],
      rowIndex: issue.path[0],
    }));
    const combined = [...formatted, ...isColumnNotExists];
    const rowSet = new Set<number>();
    for (const issue of combined) {
      if (typeof issue.rowIndex === "number") {
        rowSet.add(issue.rowIndex);
      }
    }
    return { errorIssues: combined, errorRowSet: rowSet };
  }, [errorIssuesState, isColumnNotExists]);

  const dataError = useMemo(
    () =>
      errorRowSet.size > 0
        ? data.filter((row) => errorRowSet.has(row.__rowNum__))
        : [],
    [errorRowSet, data],
  );

  const dataFiltered = useMemo(
    () =>
      errorRowSet.size > 0
        ? data.filter((row) => !errorRowSet.has(row.__rowNum__))
        : data,
    [errorRowSet, data],
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

  useEffect(() => {
    if (!validationSchema || isColumnNotExists.length === headers.length) return;
    if (!window.Worker) {
      console.log("Worker not supported");
      return;
    }

    const worker = createWorker();
    const schemaTOJSON = JSON.stringify(z.toJSONSchema(validationSchema));

    worker.postMessage({
      schema: schemaTOJSON,
      data: dataFilt,
    });

    worker.onmessage = (event) => {
      const { result } = event.data;
      setErrorIssuesState(JSON.parse(result?.error?.message));
    };

    worker.onerror = (event) => {
      console.log("worker.onerror", event);
    };

    return () => worker.terminate();
  }, [dataFilt, validationSchema]);

  useEffect(() => {
    setErrorIssuesState([])
  }, [file])

  return {
    dataFiltered,
    dataError,
    onSetErrorIssuesLog,
    errorIssues,
    errorMap,
  };
};
