import { Telegraf } from "telegraf";
import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN);
const chat_id = process.env.chat_id;
const chat_id2 = process.env.chat_id2;
// const message = "error: *claim experienced an error*";
// const error = "error";

export async function sendMessage(chat_id, error) {
  await bot.telegram.sendMessage(chat_id, error, {
    parse_mode: "MarkdownV2",
    disable_web_page_preview: true,
  });
}

// sendMessage(chat_id2, tx_message);
// console.log(sendMessage());

// Enable graceful stop
// process.once("SIGINT", () => bot.stop("SIGINT"));
// process.once("SIGTERM", () => bot.stop("SIGTERM"));

// exports.send = send;
// module.exports = { send };
// export function sendMessage()
// export function send()
