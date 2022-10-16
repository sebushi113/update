import { run } from "./update_cpu4.js";
import moment from "moment";

const date = "YYYY-MM-DD HH:mm:ss";

export default async function handler(req, res) {
  console.time("run");
  console.log(moment(new Date()).format(date) + " | run start");
  await run();
  console.log(moment(new Date()).format(date) + " | run stop");
  console.timeEnd("run");
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.send("cpu4 updated");
}
