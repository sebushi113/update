// import { sendMessage } from "./notify.js";
import { run } from "./update_cpu4.js";
const chat_id2 = process.env.chat_id2;
const message = "hello cron test";

export default async function update(req, res) {
  await run();
  // res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.send("cpu4 updated");
}
