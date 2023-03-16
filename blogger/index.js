import { config } from "dotenv";
import { generateArticleFromTitle } from "./utils/openai.js";
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
  console.log("Welcome to Blogger!\n");
  rl.question("\nEnter a title: ", async (title) => {
    console.log(
      '\nPerfect! Generating article with title: "' + title + '"...\n\n'
    );
    const article = await generateArticleFromTitle(title);
    const formattedArticleName = formatTitleIntoFileName(title);

    const parsedArticle = pipeline(article);

    writeFileSync("./articles/" + formattedArticleName + ".md", parsedArticle);

    console.log(
      "\nArticle generated! Check out the articles folder with the name: " +
        formattedArticleName +
        ".md\n"
    );

    rl.close();
  });
}

start();
