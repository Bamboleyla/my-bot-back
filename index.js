const TelegramBot = require("node-telegram-bot-api");
const express = require("express");
const corse = require("cors");
const config = require("config");
const cookieParser = require("cookie-parser");
const { dialog_start } = require("./src/dialogs/dialog_start");
const router = require("./src/routes/routes");
const errorMiddleware = require("./src/middlewares/error-middleware");

// Create a bot that uses 'polling' to fetch new updates
// const bot = new TelegramBot(config.get("telegrammToken"), { polling: true });
const app = express();

// app.use(session({ secret: config.get("sessionSecret") }));
app.use(express.json());
app.use(cookieParser());
app.use(corse());
app.use(errorMiddleware);

//Routes
app.use("/api", router);

// Listen for any kind of message. There are different kinds of
// messages.
// bot.on("message", async (msg) => {
//   const chatId = msg.chat.id;
//   const text = msg.text;

//   if (text === "/start") {
//     dialog_start(chatId);
//   } else if (msg?.web_app_data?.data) {
//     try {
//       const data = JSON.parse(msg?.web_app_data?.data);
//       await bot.sendMessage(chatId, "Спасибо за обратную связь!");
//       await bot.sendMessage(chatId, "Ваша страна: " + data?.country);
//       await bot.sendMessage(chatId, "Ваша улица: " + data?.street);

//       setTimeout(
//         async () =>
//           await bot.sendMessage(
//             chatId,
//             "Всю информацию вы получите в этом чате"
//           ),
//         3000
//       );
//     } catch (e) {
//       console.error(e);
//     }
//   } else bot.sendMessage(chatId, "Я Вас не понимаю, введите другую команду");

// send a message to the chat acknowledging receipt of their message
// bot.sendMessage(chatId, "Received your message");
// });

// app.post("/web-data", async (req, res) => {
//   const { queryId, products = [], totalPrice } = req.body;
//   try {
//     await bot.answerWebAppQuery(queryId, {
//       type: "article",
//       id: queryId,
//       title: "Успешная покупка",
//       input_message_content: {
//         message_text: ` Поздравляю с покупкой, вы приобрели товар на сумму ${totalPrice}, ${products
//           .map((item) => item.title)
//           .join(", ")}`,
//       },
//     });
//     return res.status(200).json({});
//   } catch (e) {
//     return res.status(500).json({});
//   }
// });

const PORT = config.get("port");
const start = async () => {
  try {
    app.listen(PORT, () => console.log(`Server started on PORT: ${PORT}`));
  } catch (error) {
    console.error(error);
  }
};
start();
