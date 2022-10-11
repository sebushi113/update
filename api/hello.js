// export default function handler(request, response) {
//   response.status(200).json({
//     body: request.body,
//     query: request.query,
//     cookies: request.cookies,
//   });
// }

import * as notify from "../notify";

// `/api/hello.js`
// export default async function hello(req, res) {
//   res.statusCode = 200;
//   await notify.sendMessage();
//   res.json({ message: "test" });
// }

export default async (request, response) => {
  const sendMessage = await notify.sendMessage();
  const response = await fetch(apiURL);
  const data = await response.json();
  return response.send(data);
};

// module.exports = (req, res) => {
//   res.json({
//     hi: "test",
//   });
// };
