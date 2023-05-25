import { readFileSync, writeFileSync } from "fs";
import { format } from "prettier";
import path from "path";

export const defaultStorageLocation = "./data";
export const getFileName = (url: string) => {
  return `${url.replace(/\//g, "_")}.json`;
};

export const writeDataObjectToFile = (
  data: Record<string, string>,
  url: string
) => {
  try {
    const dataString = JSON.stringify(data);
    const formattedDataString = format(dataString, { parser: "json" });

    const fileName = getFileName(url);
    const filePath = path.join(defaultStorageLocation, fileName);
    writeFileSync(filePath, formattedDataString);
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};
