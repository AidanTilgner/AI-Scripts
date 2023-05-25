import type { ReadLine } from "readline";

export const asyncQuestion = async (rl: ReadLine, question: string) => {
  return new Promise<string>((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
};
