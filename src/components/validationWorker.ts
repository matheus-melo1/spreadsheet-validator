// import z, { ZodObject } from "zod";

declare var self: DedicatedWorkerGlobalScope;
export {};

self.onmessage = (event) => {
  const { string } = event.data;
  const receive = { string, data: "recebe" };

  // const validate = onValidationSchema(schema, data);

  self.postMessage(receive);
};

// function onValidationSchema(schema: ZodObject, data: any[]) {
//   if (!schema) return;
//
//   return z.array(z.object(schema.shape)).safeParse(data);
// }
