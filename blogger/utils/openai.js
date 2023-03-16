import { Configuration, OpenAIApi } from "openai";
import { config } from "dotenv";
import cf from "../config.json" assert { type: "json" };
import { readFileSync } from "fs";
config({ path: "../.env" });

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

export const openai = new OpenAIApi(configuration);

export const generateArticleFromTitle = async (title) => {
  const initialPrompt = cf.initial_prompt;
  const userPromptText = getArticleRequestPromptFromTitle(title);

  const messages = [
    {
      role: "system",
      content: initialPrompt,
    },
    {
      role: "user",
      content: userPromptText,
    },
  ];

  const { data } = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: messages,
  });

  const selected = data.choices[0].message.content;

  return selected;
};

const getArticleRequestPromptFromTitle = (title) => {
  const exampleArticle = String(readFileSync("./articles/example.md"));
  const prompt = `
    Please generate an article entitled "${title}". The article should be long enough to be interesting, but not
    too long. The article should be written in a way that is accessible to a general audience, but also specifically
    curated to a person who fits the following description:

    "${cf.ideal_reader.description}"

    The article should follow the following writing convention, and be formatted as a markdown file.
    Please leave anything surrounded by {{}} alone, they will be used for later parsing:

    ${exampleArticle}
  `;

  return prompt;
};
