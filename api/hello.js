// export default function handler(request, response) {
//   response.status(200).json({
//     body: request.body,
//     query: request.query,
//     cookies: request.cookies,
//   });
// }

import * as notify from "../notify";

// `/api/hello.js`
export default async function hello(req, res) {
  res.statusCode = 200;
  await notify.sendMessage();
  res.json({ message: "test" });
}

// module.exports = (req, res) => {
//   res.json({
//     hi: "test",
//   });
// };
