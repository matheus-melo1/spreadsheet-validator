export type DateFormatType =
  | "DD/MM/YYYY"
  | "YYYY-MM-DD"
  | "DD/MM/YY"
  | "MM/DD/YYYY";

export function formatDate(date: Date, type: DateFormatType = "DD/MM/YYYY") {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();

  const formatted = {
    "DD/MM/YYYY": `${dd}/${mm}/${yyyy}`,
    "YYYY-MM-DD": `${yyyy}-${mm}-${dd}`,
    "DD/MM/YY": `${dd}/${mm}/${yyyy.toString().slice(-2)}`,
    "MM/DD/YYYY": `${mm}/${dd}/${yyyy}`,
  };

  return formatted[type];
}
