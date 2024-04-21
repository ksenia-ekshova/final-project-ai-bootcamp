require('dotenv').config();
const TelegramApi = require('node-telegram-bot-api')
const { MAX_CHARACTERS, MAX_TURNS, GENRES, maxTurnsOptions, genresOptions, gptOptions, maxCharacterOptions, gameInstructions } = require('./utils');
const { startGameSession } = require('./gameSession');

const bot = new TelegramApi(process.env.TELEGRAM_TOKEN, {polling: true})

const gameSettings = {};

const spawnBot = () => {
    bot.on('message', async (msg) => {
        const text = msg.text;
        const chatId = msg.chat.id;
        
        if (text === '/start') {
            await bot.sendSticker(chatId, 'https://cdn.midjourney.com/7d582fdf-8578-444d-a8c0-610aaefd6304/0_3.webp');
            await bot.sendMessage(chatId, 'Welcome adventurer! 🎲 Embark on quests in the world of Roleplaying Games.');
        }

        if (text === '/instructions') {
            await bot.sendMessage(chatId, gameInstructions);
        }

        if (text === '/create') {
            await bot.sendMessage(chatId, 'Choose your GPT version:', gptOptions);//wb good to add disclaimer with link to models
        }

        if (text === 'GPT-4' || text === 'GPT-3') {
            gameSettings[chatId] = { isGameStarted: true, gptVersion: text };
            await bot.sendMessage(chatId, 'Choose the game genre:', genresOptions);
        }

        if (GENRES.includes(text)) {
            gameSettings[chatId] = { ...gameSettings[chatId], genre: text };
            await bot.sendMessage(chatId, 'The maximum length of each scenario (# letters):', maxCharacterOptions);
        }

        if (MAX_CHARACTERS.includes(text)) {
            gameSettings[chatId] = { ...gameSettings[chatId], max_chars: text };
            await bot.sendMessage(chatId, 'The max rounds/turns:', maxTurnsOptions);
        }

        if (MAX_TURNS.includes(text)) {
            gameSettings[chatId] = { ...gameSettings[chatId], turns: text };
            await bot.sendMessage(chatId, `Great. Preparing the story...`);
            const initialGameSettingResponse = await startGameSession(gameSettings[chatId], text, true);
            gameSettings[chatId].round = 2;
            await bot.sendMessage(chatId, initialGameSettingResponse);
        }

        if (gameSettings[chatId]?.isGameStarted && gameSettings[chatId]?.round && gameSettings[chatId]?.round >= 2) {
            const response = await startGameSession(gameSettings[chatId], text);
            await bot.sendMessage(chatId, response);
        }
    });
}

spawnBot();