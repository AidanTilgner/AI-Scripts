import { config } from "dotenv";
import readline from "readline";
import { buildPageContext } from "./cli/actions";
import { asyncQuestion } from "./cli/util";

config({ path: "../.env" });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const options = {
  B: {
    action: buildPageContext,
    description: "Build a context object for a page",
  },
};

const displayMenu = () => {
  console.log("Select an action: \n");
  Object.keys(options).forEach((option) => {
    const { description } = options[option];
    console.log(`${option}: ${description}`);
  });
  console.log("\n");
};

const main = async () => {
  // have the user select an action
  displayMenu();
  const action = await asyncQuestion(rl, "Action: ");
  if (!Object.keys(options).includes(action)) {
    console.log("Invalid action");
    rl.close();
  }
  options[action].action(rl);
};

main();
