import { z } from "zod";

export type ErrorLog = z.core.$ZodIssue & {
  column?: string;
  rowIndex?: number;
};
