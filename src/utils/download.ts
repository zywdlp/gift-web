import type { AxiosResponse } from "axios";

export function downloadBlob(response: AxiosResponse<Blob>, filename: string) {
  const url = URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
