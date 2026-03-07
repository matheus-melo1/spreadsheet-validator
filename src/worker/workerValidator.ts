import { z } from "zod";

declare var self: DedicatedWorkerGlobalScope;
export {};

self.onmessage = (event: MessageEvent<any>) => {
  const { schema, data } = event.data as {
    schema: string;
    data: any[];
  };

  const schemaParsed = z.fromJSONSchema(JSON.parse(schema));

  const result = z.array(z.object(schemaParsed?.shape)).safeParse(data);

  self.postMessage({
    result,
  });
};
