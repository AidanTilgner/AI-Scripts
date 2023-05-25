import type { ReadLine } from "readline";
import { handleBuildContextObjectForPage } from "../utils/context";
import { asyncQuestion } from "./util";

export const buildPageContext = async (rl: ReadLine) => {
  try {
    const url = await asyncQuestion(rl, "Enter a URL: ");
    const isValidUrl = url.includes("http");
    if (!isValidUrl) {
      console.log("Invalid URL");
      rl.close();
    }
    const contextObject = await handleBuildContextObjectForPage(url, true);
    console.log("Built context object: ", contextObject);
    rl.close();
  } catch (error) {
    console.error(error);
    rl.close();
  }
};
