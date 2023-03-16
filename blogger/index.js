import { config } from "dotenv";
import { generateArticleFromTitleAndPoints } from "./utils/openai.js";
import readline from "readline";
import { writeFileSync } from "fs";
import { formatTitleIntoFileName } from "./utils/formatting.js";
import { pipeline } from "./utils/pipeline.js";

config({ path: "../.env" });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function start() {
  console.info("Welcome to Blogger!\n");
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
