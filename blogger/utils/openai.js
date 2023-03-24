import { Configuration, OpenAIApi } from "openai";
import { config } from "dotenv";
import cf from "../config.json" assert { type: "json" };
import { readFileSync } from "fs";
import { format } from "prettier";
import { getArticleFromHistory, trackArticle } from "./track.js";

config({ path: "../.env" });

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

export const openai = new OpenAIApi(configuration);

const makeChatCompletionRequest = async (messages) => {
  const { data } = await openai.createChatCompletion({
    model: cf.model.default || "gpt-3.5-turbo",
    messages: messages,
  });

  return data;
};

export const generateArticleFromTitleAndPoints = async (title, points) => {
  try {
    const initialPrompt = cf.initial_prompt;
    const userPromptText = getArticleRequestPromptFromTitleAndPoints(
      title,
      points
    );

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

    const id = trackArticle(title, messages);

    const data = await makeChatCompletionRequest(messages);

    const selected = data.choices[0].message.content;

    return {
      article: selected,
      messages,
      article_id: id,
    };
  } catch (e) {
    console.error(e);
    console.error(
      "Error generating article. Please try again. You can use the article ID in data/history.json to retry this exact message."
    );
    return {
      article: null,
      messages: [],
    };
  }
};

const getArticleRequestPromptFromTitleAndPoints = (title, points) => {
  const exampleArticle = String(readFileSync("./articles/example.md"));
  const prompt = `
    Please generate an article entitled "${title}". The article should be long enough to be interesting, but not
    too long. 
    
    The article should be written in a way that is accessible to a general audience, but also specifically
    curated to a person who fits the following description:

    "${cf.ideal_reader.description}"

    ${
      points?.length > 0
        ? "Here are some basic points that the article should cover:"
        : ""
    }
    ${points?.length > 0 ? points.map((p) => `- ${p}`).join("\n") : ""}

    The article should be at least ${cf.article_min_length.value} ${
    cf.article_min_length.unit
  } long, and at most ${cf.article_max_length.value} ${
    cf.article_max_length.unit
  } long.

    The article should follow the following writing convention, and be formatted as a markdown file:

    ${exampleArticle}
  `;

  const formatted = format(prompt, { parser: "markdown" });

  return formatted;
};

export const retryRequestFromOldArticle = async (article_id) => {
  const oldArticle = getArticleFromHistory(article_id);
  if (!oldArticle) {
    console.error(
      "Article not found in history. Are you sure that's the right ID?"
    );
    return;
  }

  const { title, messages } = oldArticle;

  const data = await makeChatCompletionRequest(messages);

  const selected = data.choices[0].message.content;

  return {
    article: selected,
    messages,
    article_id,
  };
};
