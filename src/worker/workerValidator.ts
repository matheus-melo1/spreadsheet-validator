import { z, ZodObject } from "zod";

declare var self: DedicatedWorkerGlobalScope;
export { };

self.onmessage = <T>(event: MessageEvent<T>) => {
  const { schema, data } = event.data as {
    schema: string;
    data: T[];
  };

  const schemaParsed = z.fromJSONSchema(JSON.parse(schema)) as ZodObject<any>;

  const result = z.array(z.object(schemaParsed?.shape)).safeParse(data);

  self.postMessage({
    result,
  });
};
