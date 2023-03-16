import cf from "../config.json" assert { type: "json" };
import { format } from "prettier";

export const pipeline = (article) => {
  let newArticle = article;
  newArticle = addToFrontMatter(newArticle, "author", cf.author.name);
  newArticle = addToFrontMatter(newArticle, "post_date", getCurrentDate());
  return newArticle;
};

const getCurrentDate = () => {
  // get date formatted as MM-DD-YYYY
  const date = new Date();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear();
  return `${month}-${day}-${year}`;
};

const addToFrontMatter = (article, key, value) => {
  const newArticle = String(article);
  const frontmatterEndIndex = newArticle.split("\n").indexOf("---", 2);
  const frontmatter = newArticle.split("\n").slice(2, frontmatterEndIndex);
  const datapoints = [];
  frontmatter.forEach((l) => {
    const [key, value] = l.split(":");
    if (!key || !value) return;
    datapoints.push({ key: key.trim(), value: value.trim() });
  });
  const newArticleWithoutFrontmatter = newArticle
    .split("\n")
    .slice(frontmatterEndIndex + 1)
    .join("\n");

  datapoints.push({ key, value });

  const newFrontmatter = format(
    `
  ---
  ${datapoints.map((d) => `${d.key}: ${d.value}`).join("\n")}
  ---`,
    { parser: "markdown" }
  );

  const newArticleWithFrontmatter =
    newFrontmatter + newArticleWithoutFrontmatter;

  return newArticleWithFrontmatter;
};

const testArticle = `
---
title: Hello World in JavaScript
description: Learn how to write your first JavaScript code with a "Hello World" example.
tags: [web development, JavaScript, psilocybin therapy centers]
test: just to see
---

# Hello World in JavaScript
`;

(() => {
  console.log(pipeline(testArticle));
})();
