const TelegramBot = require("node-telegram-bot-api");
const express = require("express");
const corse = require("cors");
const { token, webAppUrl } = require("./config");

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });
const app = express();

app.use(express.json());
app.use(corse());

// Listen for any kind of message. There are different kinds of
// messages.
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  const date = new Date(msg.date);

  if (text === "/start" && chatId !== 770696686) {
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
  } else if (msg?.web_app_data?.data) {
    try {
      const data = JSON.parse(msg?.web_app_data?.data);
      await bot.sendMessage(chatId, "Спасибо за обратную связь!");
      await bot.sendMessage(chatId, "Ваша страна: " + data?.country);
      await bot.sendMessage(chatId, "Ваша улица: " + data?.street);

      setTimeout(
        async () =>
          await bot.sendMessage(
            chatId,
            "Всю информацию вы получите в этом чате"
          ),
        3000
      );
    } catch (e) {
      console.error(e);
    }
  } else bot.sendMessage(chatId, "Я Вас не понимаю, введите другую команду");

  // send a message to the chat acknowledging receipt of their message
  // bot.sendMessage(chatId, "Received your message");
});

app.post("/web-data", async (req, res) => {
  const { queryId, products = [], totalPrice } = req.body;
  try {
    await bot.answerWebAppQuery(queryId, {
      type: "article",
      id: queryId,
      title: "Успешная покупка",
      input_message_content: {
        message_text: ` Поздравляю с покупкой, вы приобрели товар на сумму ${totalPrice}, ${products
          .map((item) => item.title)
          .join(", ")}`,
      },
    });
    return res.status(200).json({});
  } catch (e) {
    return res.status(500).json({});
  }
});

const PORT = 8000;
app.listen(PORT, () => console.log(`Server started on PORT: ${PORT}`));
