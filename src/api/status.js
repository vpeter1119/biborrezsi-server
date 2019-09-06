var app = require("express");
var router = app.Router();

router.get("", (req, res, next) => {
  res.status(200).json({
    running: true
  });
});

module.exports = router;
