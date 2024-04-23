require("dotenv").config();
const OpenAI = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPEN_AI_API_KEY });

let assistant = null;
let thread = null;

const handleOpenAiRequest = async (threadId, assistantId) => {
  let run = await openai.beta.threads.runs.createAndPoll(threadId, {
    assistant_id: assistantId,
  });

  let result = "";

  if (run.status === "completed") {
    const messages = await openai.beta.threads.messages.list(run.thread_id);

    for (const dataItem of messages.data) {
      result = dataItem.content?.[0]?.text?.value ?? "";
      console.log(result);
      console.log("_____________");
    }

    result = messages.data[0].content?.[0]?.text?.value ?? "";
  } else {
    result = "The game session has been interrupted. Please try again.";
  }

  return result;
};

const startGameSession = async (
  gameSettings,
  userPrompt,
  isFirstTurn = false
) => {
  // for multiple users add (The game will be played by {2} players, ask them questions in turns. --- optional)

  if (isFirstTurn) {
    assistant = await openai.beta.assistants.create({
      name: "Dungeon and dragons master",
      instructions: `
                You are the author of an interactive quest in a ${gameSettings.genre} setting. 
                Come up with an interesting story. Your message is a part of the story that forces the player to make a choice.
                Our game should consist of a small part (up to ${gameSettings.max_chars} characters) of your story and the options for player actions you propose.
                At the end of each of your messages, ask a question about how the player should act in the current situation. 
                Offer three options to choose from, but leave the opportunity to offer actions by player.
                The quest must be completed within ${gameSettings.turns} player(s) turns.
                With each turn the situation should become more intense and logically related to the previous turn.
                The player may encounter various dangers on his journey. 
                If the player chooses a bad answer, player may die and then the game will end.
                Use a speaking style that suits the setting.
                Each time you would be notified with the current turn/round number.
            `,
      tools: [{ type: "code_interpreter" }],
      model:
        gameSettings.gptVersion === "GPT-4" ? "gpt-4-turbo" : "gpt-3.5-turbo",
    });
    thread = await openai.beta.threads.create();
    const message = await openai.beta.threads.messages.create(
      thread.id,
      {
        role: "assistant",
        content: "Turn 1. Generate the initial story for the game.",
      },
      {
        role: "user",
        content: "We are ready to start the game.",
      }
    );

    const response = await handleOpenAiRequest(thread.id, assistant.id);
    return response;
  } else {
    if (!thread || !assistant) {
      return "rofl";
    }
    console.log("********Hello there********");
    const message = await openai.beta.threads.messages.create(
      thread.id,
      {
        role: "assistant",
        content: `Turn or round number ${gameSettings.round}`,
      },
      {
        role: "user",
        content: userPrompt,
      }
    );

    const response = await handleOpenAiRequest(thread.id, assistant.id);
    return response;
  }
};

async function generateImageResponse(prompt) {
  const openai = new OpenAI({ apiKey: process.env.OPEN_AI_API_KEY });
  const response = await openai.images.generate({
    model: "dall-e-2",
    prompt: prompt,
    n: 1,
    size: "256x256",
  });
  return response;
}

module.exports = {
  startGameSession,
  generateImageResponse,
};
