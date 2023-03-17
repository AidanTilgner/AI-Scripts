import { writeFileSync } from "fs";
import { format } from "prettier";
import cf from "../config.json" assert { type: "json" };

export const outputArticle = (article, fileName) => {
  const secondaryOutputLocation = cf.output_location.path;

  // first write to ./articles/
  writeFileSync(
    "./articles" + fileName + ".md",
    format(article, { parser: "markdown" })
  );

  // then write to secondary location
  if (secondaryOutputLocation) {
    writeFileSync(
      secondaryOutputLocation + fileName + ".md",
      format(article, { parser: "markdown" })
    );
  }
};
