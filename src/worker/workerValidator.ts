import * as z from "zod";

declare var self: DedicatedWorkerGlobalScope;
export {};

self.onmessage = (event: MessageEvent<any>) => {
  const { schema, data } = event.data as {
    schema: string;
    data: any[];
  };

  const schemaParsed = z.fromJSONSchema(JSON.parse(schema));

  const result = z.array(z.object(schemaParsed?.shape)).safeParse(data);

  if (!result.success) {
    self.postMessage({
      result: result.success,
      data: result.data,
      error: result.error.format(),
    });
    return;
  }

  self.postMessage({
    result: result?.success,
    data: result?.data,
    error: result?.error,
  });
};
