import { existsSync, writeFileSync, readFileSync } from "fs";
import { randomBytes } from "crypto";
import { formatTitleIntoFileName } from "./formatting.js";

export const trackArticle = (title, messages) => {
  checkHistoryFileExistsAndCreateIfNot();
  const id = addArticleToHistory(title, messages);
  return id;
};

const checkHistoryFileExistsAndCreateIfNot = () => {
  if (!existsSync("./data/history.json")) {
    writeFileSync("./data/history.json", "[]");
  }
};

const addArticleToHistory = (title, messages) => {
  const randomArticleId = randomBytes(16).toString("hex");

  const toAdd = {
    id: randomArticleId,
    article: {
      title,
      fileName: `${formatTitleIntoFileName(title)}.md`,
    },
    messages,
  };

  const history = JSON.parse(String(readFileSync("./data/history.json")));

  const newHistory = [...history, toAdd];

  writeFileSync("./data/history.json", JSON.stringify(newHistory));

  return randomArticleId;
};
