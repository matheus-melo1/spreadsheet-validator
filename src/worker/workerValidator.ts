import { z } from "zod";

declare var self: DedicatedWorkerGlobalScope;
export {};

onmessage = (event: MessageEvent<any>) => {
  const { schema, data } = event.data as {
    schema: string;
    data: any[];
  };

  // const schemaParsed = JSON.parse(schema);

  const schemaParsed = z.object({ Nome: z.string().min(18) });

  const result = z.array(z.object(schemaParsed?.shape)).safeParse(data);

  // if (!result.success) {
  //   self.postMessage({
  //     result: result.success,
  //     data: result.data,
  //     error: result.error.format(),
  //   });
  //   return;
  // }

  self.postMessage({
    result,
  });
};
