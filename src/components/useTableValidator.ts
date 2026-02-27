import z, { ZodObject, ZodRawShape } from "zod";
import { ErrorLog } from "../types/errorLog.type";
import { ErrorCode } from "../types/enum/errorCode.enum";
import { useMemo } from "react";

interface ITableValidator<T extends ZodRawShape> {
  data: any[];
  headers: string[];
  schema?: ZodObject<T>;
  errorIssuesLog?: (error: ErrorLog[] | undefined) => void;
}

export const useTableValidator = <T extends ZodRawShape>(
  props: ITableValidator<T>,
) => {
  const { data, headers, schema, errorIssuesLog } = props;

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

  const onSetErrorIssuesLog = () => {
    errorIssuesLog?.(errorIssues as ErrorLog[]);
  };

  return {
    dataFiltered,
    dataError,
    onSetErrorIssuesLog,
    errorIssues,
  };
};
