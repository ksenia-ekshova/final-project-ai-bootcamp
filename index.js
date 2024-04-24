require("dotenv").config();
const TelegramApi = require("node-telegram-bot-api");

const {
  MAX_TURNS,
  LANGUAGES,
  GENRES,
  maxTurnsOptions,
  gptOptions,
  languageOptions,
  genresOptions,
  gameInstructions,
  extractOptionsFromAIResponse,
} = require("./utils");
const { startGameSession, generateImageResponse } = require("./gameSession");

const bot = new TelegramApi(process.env.TELEGRAM_TOKEN, { polling: true });

const gameSettings = {};

const spawnBot = () => {
  bot.on("message", async (msg) => {
    const text = msg.text;
    const chatId = msg.chat.id;

    if (text === "/start") {
      await bot.sendSticker(
        chatId,
        "https://cdn.midjourney.com/7d582fdf-8578-444d-a8c0-610aaefd6304/0_3.webp"
      );
      await bot.sendMessage(
        chatId,
        `Welcome adventurer! 🎲 Embark on quests in the world of Roleplaying Games.\n` +
          `Enter "/instructions" to get the commands needed for playing\n` +
          `Enter "/create" to start the game\n`
      );
    }

    if (text === "/instructions") {
      await bot.sendMessage(chatId, gameInstructions);
      return;
    }

    if (text === "/create") {
      await bot.sendMessage(chatId, "Choose the AI model:", gptOptions);
      return;
    } //add posibility to create custom answer with free text

    if (text === "custom answer") {
      await bot.sendMessage(chatId, "Waiting for your response...");
      return;
    }

    if (text.startsWith("GPT-3") || text.startsWith("GPT-4")) {
      gameSettings[chatId] = {
        isGameStarted: true,
        language: "English",
        gptVersion: text.substring(0, 5),
        max_chars: "750",
      };
      await bot.sendMessage(chatId, "Choose the game genre:", genresOptions);
      return;
    }

    if (GENRES.includes(text)) {
      gameSettings[chatId].genre = text;
      await bot.sendMessage(chatId, "The max rounds/turns:", maxTurnsOptions);
      return;
    }

    if (MAX_TURNS.includes(text)) {
      gameSettings[chatId].turns = text;
      await bot.sendMessage(chatId, `Great. Preparing the story...`);
      const initialGameSettingResponse = await startGameSession(
        gameSettings[chatId],
        text,
        true
      );
      await bot.sendMessage(chatId, initialGameSettingResponse);
      const choices = extractOptionsFromAIResponse(initialGameSettingResponse);
      await bot.sendMessage(chatId, "Choose the option", {
        reply_markup: {
          keyboard: choices,
        },
      });

      const imageGenerate = await generateImageResponse(
        initialGameSettingResponse
      );
      await bot.sendPhoto(chatId, imageGenerate.data[0].url);

      gameSettings[chatId].round = 2;
      return;
    }

    if (
      gameSettings[chatId]?.isGameStarted &&
      gameSettings[chatId]?.round &&
      gameSettings[chatId]?.round >= 2
    ) {
      if (gameSettings[chatId].round > +gameSettings[chatId].turns) {
        await bot.sendMessage(chatId, "Game finished.");
        return;
      }

      gameSettings[chatId].round += 1;

      const response = await startGameSession(gameSettings[chatId], text);
      await bot.sendMessage(chatId, response);
      const choices = extractOptionsFromAIResponse(response);
      await bot.sendMessage(chatId, "Choose the option", {
        reply_markup: {
          keyboard: choices,
        },
      });

      const imageGenerate = await generateImageResponse(response);
      await bot.sendPhoto(chatId, imageGenerate.data[0].url);
      return;
    }
  });
};

spawnBot();
