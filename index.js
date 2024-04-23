require('dotenv').config();
const TelegramApi = require('node-telegram-bot-api')

const { MAX_CHARACTERS, MAX_TURNS, LANGUAGES, GENRES, maxTurnsOptions, languageOptions, genresOptions, gptOptions,generateImageOptions, maxCharacterOptions, gameInstructions } = require('./utils');
const { startGameSession, generateImageResponse } = require('./gameSession');

const bot = new TelegramApi(process.env.TELEGRAM_TOKEN, {polling: true})

const gameSettings = {};

let generate_image_state = false;
let image_promt = null;

const spawnBot = () => {
    bot.on('message', async (msg) => {
        const text = msg.text;
        const chatId = msg.chat.id;

        if (text === '/start') {
            await bot.sendSticker(chatId, 'https://cdn.midjourney.com/7d582fdf-8578-444d-a8c0-610aaefd6304/0_3.webp');
            await bot.sendMessage(chatId, 'Welcome adventurer! 🎲 Embark on quests in the world of Roleplaying Games. Enter "/instructions" to get the commands needed for playing');
        }

        if (text === '/instructions') {
            await bot.sendMessage(chatId, gameInstructions);
            return;
        }

        if (text === '/create') {
            await bot.sendMessage(chatId, 'Choose your language:', languageOptions);
            return;
        }//add posibility to create custom answer with free text

        if (LANGUAGES.includes(text)) {
            gameSettings[chatId] = { isGameStarted: true, language: text };
            await bot.sendMessage(chatId, 'Choose your GPT version:', gptOptions);//wb good to add disclaimer with link to models
            return;
        }
       
        if (text === 'GPT-4' || text === 'GPT-3') {
            gameSettings[chatId] = { isGameStarted: true, gptVersion: text };
            await bot.sendMessage(chatId, 'Choose the game genre:', genresOptions);
            return;
        }//add posibility to create custom answer with free text

        if (GENRES.includes(text)) {
            gameSettings[chatId] = { ...gameSettings[chatId], genre: text };
            await bot.sendMessage(chatId, 'The maximum length of each scenario (# letters):', maxCharacterOptions);
            return;
        }

        if (MAX_CHARACTERS.includes(text)) {
            gameSettings[chatId] = { ...gameSettings[chatId], max_chars: text };
            await bot.sendMessage(chatId, 'The max rounds/turns:', maxTurnsOptions);
            return;
        }

        if (MAX_TURNS.includes(text)) {
            gameSettings[chatId] = { ...gameSettings[chatId], turns: text };
            await bot.sendMessage(chatId, `Great. Preparing the story...`);
            const initialGameSettingResponse = await startGameSession(gameSettings[chatId], text, true);
            gameSettings[chatId].round = 2;
            await bot.sendMessage(chatId, initialGameSettingResponse);
            return;
        }

        if (gameSettings[chatId]?.isGameStarted && gameSettings[chatId]?.round && gameSettings[chatId]?.round >= 2) {

            if (generate_image_state) {
                if (text === 'Yes') {
                    await bot.sendMessage(chatId, `Great. generating the image...`);
                    const imageGenetate = await generateImageResponse(image_promt);
                    await bot.sendPhoto(chatId, imageGenetate.data[0].url)
                }
            }

            const response = await startGameSession(gameSettings[chatId], text);
            await bot.sendMessage(chatId, response);
            await bot.sendMessage(chatId, "If you want the image of the environment, you must select it.", generateImageOptions);
            image_promt = response;
            generate_image_state = true;
            return;
        }
    });
}

spawnBot();