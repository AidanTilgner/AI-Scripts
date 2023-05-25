import { makeChatCompletionRequest } from "./openai";
import { getMultiplePageTextContent, getWebsitePageLinks } from "./puppeteer";
import type { ChatCompletionRequestMessage } from "openai";
import { validateJSON } from "./validation";
import { writeDataObjectToFile } from "./files";

export const handleBuildContextObjectForPage = async (
  url: string,
  writeToFile: boolean
) => {
  try {
    const pageLinks = await getWebsitePageLinks(url);
    console.info(
      "Building a context object based on the following found sources: ",
      pageLinks,
      "\n"
    );

    const allTextContent = await getMultiplePageTextContent(pageLinks);

    const contextObjects: Record<string, string>[] = [];

    for (const { url, content } of allTextContent) {
      const contextObject = await getContextObjectForContent(url, content);
      contextObjects.push(contextObject);
    }

    const contextObject = contextObjects.reduce((acc, curr) => {
      return { ...acc, ...curr };
    }, {});

    console.info("Finished building context object.");

    if (writeToFile) {
      const written = await writeDataObjectToFile(contextObject, url);
      if (!written) {
        console.error("Unable to write to file");
      }
    }

    return contextObject;
  } catch (error) {
    console.error(error);
    return {};
  }
};

export const getContextObjectForContent = async (
  url: string,
  textContent: string
) => {
  try {
    console.info("Attempting to get context object for content on page: ", url);
    const systemPrompt = getDefaultPromptForPage();
    const userPrompt = getPromptForContent(textContent);

    const messages: ChatCompletionRequestMessage[] = [
      {
        content: systemPrompt,
        role: "system",
      },
      {
        content: userPrompt,
        role: "user",
      },
    ];

    const llmResponse = await makeChatCompletionRequest(messages);

    if (!llmResponse) {
      console.error("No response from LLM, retrying...");
      return await getContextObjectForContent(url, textContent);
    }

    const isValidJSON = validateJSON(llmResponse);

    if (!isValidJSON) {
      console.error("Invalid JSON response from LLM, retrying...");
      return await getContextObjectForContent(url, textContent);
    }

    const contextObject = JSON.parse(llmResponse);

    console.info("Successfully got context object for content on page: ", url);
    return contextObject;
  } catch (error) {
    console.error(error);
    return {};
  }
};

export const getDefaultPromptForPage = () => {
  return `
          You are are context builder! What this means, is that you will be given unstructured data, and your job is to structure it.
  
          The data you will return will be in the form of a JSON object, which will be a series of key-value pairs. The key will be the name of the data, and the value will be the data itself.
  
          For example, if you were given the following data:
  
          "John Doe is 30 years old and lives in New York, NY"
  
          You may return the following JSON object:
  
          {
              "people": [
                  {
                      "name": "John Doe",
                      "age": 30,
                      "location": "New York, NY"
                  }
              ]
          }
  
          It's important to consider that the format of the raw data could be anything, but the output should always be a JSON object.
      
          Things to consider when building your context object:
          - People who might be important
          - Places that might be important
          - Services

          Also consider, this is a context object which will be referenced by other AI models in order to promote a specific client. So, the more information you can provide to accomplish this, the better.
  
          Hard Rules:
          - The output must be a JSON object
          - The output must be valid JSON
          - The output must be a series of key-value pairs, where the key is a semantic name for the data, and the value is the data itself
      `;
};

export const getPromptForContent = (content: string) => {
  return `
    Here is some data:

    ${content}
    `;
};
