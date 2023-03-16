import { existsSync, writeFileSync, readFileSync } from "fs";
import { randomBytes } from "crypto";
import { formatTitleIntoFileName } from "./formatting.js";
import { format } from "prettier";

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

  writeFileSync(
    "./data/history.json",
    format(JSON.stringify(newHistory), {
      parser: "json",
    })
  );

  return randomArticleId;
};

export const checkTitleIsAlreadyInHistory = (title) => {
  const history = JSON.parse(String(readFileSync("./data/history.json")));

  const found = history.find((article) => article.article.title === title);

  return found;
};

export const getArticleFromHistory = (id) => {
  const history = JSON.parse(String(readFileSync("./data/history.json")));

  const found = history.find((article) => article.id === id);

  return found;
};

export const checkArticleExistsInHistory = (id) => {
  const history = JSON.parse(String(readFileSync("./data/history.json")));

  const found = history.find((article) => article.id === id);

  return found;
};
