import { Configuration, OpenAIApi, ChatCompletionRequestMessage } from "openai";
import { config } from "dotenv";
import { readFileSync } from "fs";
import { format } from "prettier";

config({ path: "../.env" });

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

export const openai = new OpenAIApi(configuration);

export const makeChatCompletionRequest = async (
  messages: ChatCompletionRequestMessage[]
) => {
  const { data } = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: messages,
  });

  return data.choices[0].message?.content;
};
