// import z, { ZodObject } from "zod";

onmessage = (event) => {
  const { string } = event.data;
  const receive = { string, data: "recebe" };

  // const validate = onValidationSchema(schema, data);

  postMessage(receive);
};

// function onValidationSchema(schema: ZodObject, data: any[]) {
//   if (!schema) return;
//
//   return z.array(z.object(schema.shape)).safeParse(data);
// }
