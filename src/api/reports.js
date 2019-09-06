var app = require("express");
var router = app.Router();

router.get("", (req, res, next) => {
  res.send("Reports route.");
});

router.post("", (req, res, next) => {
  var newReport = req.body;
  console.log(newReport);
  res.status(200).send({
    message: "Got the report!",
    report: newReport
  });
});

module.exports = router;
