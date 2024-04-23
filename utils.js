const GENRES = [
  "Fantasy",
  "Post-apocalypse",
  "Cthulhu",
  "Dungeons",
  "Noir detective",
  "Adventure",
  "Magic",
  "Sword and Sorcery",
  "Dragons",
  "Medieval",
  "Monsters",
  "Elves",
  "Dwarves",
  "Wizards",
  "Knights",
  "Tales",
  "Legendary",
  "Mythical",
  "Mystical",
  "Riddles",
];

const gameInstructions = `
    How to Play,\n\n
    1. Join the Game: The [Name of the Bot] will be added to your Telegram group chat and enter "create" to start the game\n
    2. Scenarios: The bot will present you with short, imaginative scenarios for Roleplaying game. Think about the situation and decide how your character would react.\n
    3. Respond: Type out your response as if you were your character. What would you say? What action would you take? Be creative!\n
    4. Discuss and Build: Read other players\' responses and have fun!
    5. Collaborate: Work together to solve problems\n
    6. New Adventures: When a scenario wraps up, the bot will ask if you\'re ready for a new one.
    \n\n
    Tips
    \n\n
    1. Be Imaginative: Let your creativity shine! The more unique the response, the more fun the game will be.\n
    2. Respect Others: Be kind and consider how your actions affect other players\' characters.\n
    3. Have Fun: It\'s a game! Enjoy the world of Dungeons & Dragons and let the stories unfold.
`;

const MAX_TURNS = ["5", "10"];

const generateGenresOptions = () => {
  const rows = [];
  for (let i = 0; i < GENRES.length; i += 3) {
    rows.push(GENRES.slice(i, i + 3));
  }
  return rows;
};

const generateMaxTurnsOptions = () => {
  const rows = [];
  for (let i = 0; i < MAX_TURNS.length; i += 3) {
    rows.push(MAX_TURNS.slice(i, i + 3));
  }
  return rows;
};

const generateImageOptions = {
  reply_markup: {
    keyboard: [["Yes", "No"]],
  },
};

const genresOptions = {
  reply_markup: {
    keyboard: generateGenresOptions(),
  },
};

const maxTurnsOptions = {
  reply_markup: {
    keyboard: generateMaxTurnsOptions(),
  },
};

module.exports = {
  GENRES,
  MAX_TURNS,
  gameInstructions,
  generateImageOptions,
  genresOptions,
  maxTurnsOptions,
};
