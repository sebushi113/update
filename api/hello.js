// `/api/hello.js`
// export default function hello(req, res) {
//   res.statusCode = 200;
//   res.json({ message: "test" });
// }

module.exports = (req, res) => {
  res.json({
    hi: "test",
  });
};
