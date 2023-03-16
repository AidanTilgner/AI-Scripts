import { config } from "dotenv";
import { generateArticleFromTitle } from "./utils/openai.js";
import readline from "readline";
import { writeFileSync } from "fs";
import { formatTitleIntoFileName } from "./utils/formatting.js";
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
    const formattedName = formatTitleIntoFileName(title);

    writeFileSync("./articles/" + formattedName + ".md", article);

    console.log(
      "\nArticle generated! Check out the articles folder with the name: " +
        formattedName +
        ".md\n"
    );

    rl.close();
  });
}

start();
