const TelegramBot = require("node-telegram-bot-api");
const { token, webAppUrl } = require("../../config/config");
// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

const dialog_start = async (chatId) => {
  await bot.sendMessage(
    chatId,
    "Здравствуйте, я тестовый бот, надеюсь скоро у меня появится много возможностей, а пока что можете писать и нажимать все что вам угодно! "
  );
  await bot.sendMessage(
    chatId,
    'Ниже есть кнопка "Ваши Данные" здесь вы можете указать любые данные для того что бы, получить больше возможностей ',
    {
      reply_markup: {
        keyboard: [
          [{ text: "Заполнить форму", web_app: { url: webAppUrl + "/form" } }],
          [{ text: "Ваши данные", web_app: { url: webAppUrl + "/form" } }],
        ],
      },
    }
  );
};

module.exports = { dialog_start };
