import TelegramBot from "node-telegram-bot-api";
import config from "config";

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(config.get("telegrammToken"), { polling: true });
const webAppUrl = config.get("webAppUrl");

const dialog_start = async (chatId) => {
  await bot.sendMessage(
    chatId,
    "Здравствуйте, я тестовый бот, надеюсь скоро у меня появится много возможностей, а пока что можете писать и нажимать все что вам угодно",
    {
      reply_markup: {
        keyboard: [
          [{ text: "Заполнить форму", web_app: { url: webAppUrl + "/form" } }],
          [{ text: "Ваши", web_app: { url: webAppUrl + "/form" } }],
        ],
      },
    }
  );

  await bot.sendMessage(chatId, "Ниже появиться форма, заполние ее", {
    reply_markup: {
      keyboard: [
        [{ text: "Заполнить форму", web_app: { url: webAppUrl + "/form" } }],
      ],
    },
  });

  await bot.sendMessage(chatId, "Заходи в наш магазин по кнопке ниже", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "сделать заказ", web_app: { url: webAppUrl } }],
      ],
    },
  });
};

module.exports = { dialog_start };