// export default function handler(request, response) {
//   response.status(200).json({
//     body: request.body,
//     query: request.query,
//     cookies: request.cookies,
//   });
// }

// import * as notify from "../notify";
// import { sendMessage } from "../notify";
// import { sendMessage } from "../notify.js";
// import { run } from "../update_cpu4.js";
import { run } from "../update_cpu4.js";
const chat_id2 = process.env.chat_id2;
const message = "hello cron test";

// `/api/hello.js`;
export default async function hello(req, res) {
  // await notify.sendMessage(chat_id2, message);
  // await sendMessage(chat_id2, message);
  await run();
  // res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  // res.json({ message: "hello" });
  res.send("message sent");
  // res.json(await sendMessage());
}

// cron.schedule("48 14 * * *", hello);

// export default async (request, response) => {
//   const sendMessage = await notify.sendMessage();
//   const response = await fetch(apiURL);
//   const data = await response.json();
//   return response.send(data);
// };

// module.exports = (req, res) => {
//   res.json({
//     hi: "test",
//   });
// };
