import { build, type Plugin } from "vite";

export function inlineWorkerPlugin(): Plugin {
  return {
    name: "inline-worker",
    async transform(_code, id) {
      if (!id.endsWith("?worker-inline")) return;

      const filePath = id.replace("?worker-inline", "");

      const result = await build({
        configFile: false,
        build: {
          write: false,
          lib: {
            entry: filePath,
            formats: ["iife"],
            name: "worker",
          },
          minify: true,
        },
      });

      const output = (result as any)[0].output[0].code;
      return `export default ${JSON.stringify(output)};`;
    },
  };
}
