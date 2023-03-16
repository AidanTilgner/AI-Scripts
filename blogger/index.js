import { config } from "dotenv";
import {
  generateArticleFromTitleAndPoints,
  retryRequestFromOldArticle,
} from "./utils/openai.js";
import readline from "readline";
import { writeFileSync } from "fs";
import { formatTitleIntoFileName } from "./utils/formatting.js";
import { pipeline } from "./utils/pipeline.js";
import {
  checkArticleExistsInHistory,
  getArticleFromHistory,
} from "./utils/track.js";

config({ path: "../.env" });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.info("Welcome to Blogger!\n");

function start() {
  rl.question(
    "\nWould you like to [g]enerate a new article? Or [r]etry an old one?: ",
    async (answer) => {
      switch (answer) {
        case "g":
          generateNewArticle();
          break;
        case "r":
          retryArticle();
          break;
        default:
          console.error("Invalid answer. Please try again.");
          start();
      }
    }
  );
}

async function retryArticle() {
  rl.question("\nEnter the article ID: ", async (id) => {
    const foundArticle = getArticleFromHistory(id);

    const {
      article: { fileName },
    } = foundArticle;
    if (!foundArticle) {
      console.error("Article not found. Please try again.");
      rl.close();
      return;
    }

    console.info('\nPerfect! Generating article with ID: "' + id + '"...\n\n');
    const { article, article_id } = await retryRequestFromOldArticle(id);
    if (!article) {
      console.error(
        "Error generating article. Please try again. Use article ID: " +
          article_id +
          " to retry this exact message."
      );
      rl.close();
      return;
    }

    const parsedArticle = await pipeline(article);

    writeFileSync("./articles/" + fileName + ".md", parsedArticle);

    console.info(
      "\nArticle generated! Check out the articles folder with the name: " +
        fileName +
        ".md\n"
    );

    rl.close();
  });
}

async function generateNewArticle() {
  rl.question("\nEnter a title for your article: ", async (title) => {
    console.info(
      '\nPerfect! Generating article with title: "' + title + '"...\n\n'
    );
    const pointsToCover = [];
    rl.question(
      "\nWhat points do you want to cover? (separate by commas, leave blank if none): ",
      async (points) => {
        if (points === "") {
          generateAndPublishArticle(title, pointsToCover);
          return;
        }
        const parsedPoints = points.split(",").map((p) => p.trim());
        pointsToCover.push(...parsedPoints);
        generateAndPublishArticle(title, pointsToCover);
      }
    );
  });
}

async function generateAndPublishArticle(title, points) {
  const { article, article_id } = await generateArticleFromTitleAndPoints(
    title,
    points
  );
  if (!article) {
    console.error(
      "Error generating article. Please try again. Use article ID: " +
        article_id +
        " to retry this exact message."
    );
    rl.close();
    return;
  }
  const formattedArticleName = formatTitleIntoFileName(title);

  const parsedArticle = await pipeline(article);

  writeFileSync("./articles/" + formattedArticleName + ".md", parsedArticle);

  console.info(
    "\nArticle generated! Check out the articles folder with the name: " +
      formattedArticleName +
      ".md\n"
  );

  rl.close();
}

start();
