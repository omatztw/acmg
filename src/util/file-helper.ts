import { ParseResult, parse } from "papaparse";
import { CSVData } from "../models/types";

type CsvOption = {
  header?: boolean;
};

export const csvParse = (file: File, opt?: CsvOption) => {
  return new Promise<CSVData[]>((resolve, reject) => {
    parse(file, {
      complete: (results: ParseResult<CSVData>) => {
        resolve(results?.data);
      },
      error: () => {
        reject(new Error("csv parse err"));
      },
      encoding: "shift-jis",
      header: true,
    });
  });
};
