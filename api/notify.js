import { Telegraf } from "telegraf";
import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN);

export async function sendMessage(chat_id, error) {
  await bot.telegram.sendMessage(chat_id, error, {
    parse_mode: "HTML",
    disable_web_page_preview: true,
  });
}
