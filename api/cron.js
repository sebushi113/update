import fetch from "node-fetch";

//schedule job every minute
schedule.scheduleJob("*/1 * * * *", async function () {
  const response = await fetch("https://update-nu.vercel.app/api/hello");
  const body = await response.json();

  console.log("inside cron function", body);
});

router.get("/api/hello", ensureAuthenticated, async function (req, res) {
  res.render("hello", {
    layout: "dashboard.handlebars",
    jsMain: "hello.js",
  });
});

/*
upstash cron schedule
curl -XPOST \
	"https://qstash.upstash.io/v1/publish/https://update-nu.vercel.app/api/update" \
	-H "Authorization: Bearer ********" \
	-H "Upstash-Cron: 0 21 * * *"

*/
