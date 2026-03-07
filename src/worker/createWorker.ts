import workerInline from "../worker/workerValidator?worker-inline";

export function createWorker() {
  const blob = new Blob([workerInline], { type: "text/javascript" });
  const url = URL.createObjectURL(blob);
  const worker = new Worker(URL.createObjectURL(blob));

  worker.addEventListener("error", URL.revokeObjectURL(url));

  return worker;
}
