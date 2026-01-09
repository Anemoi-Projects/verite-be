const express = require("express");
const {
  addToMailList,
  getMailList,
} = require("../controllers/mailController/mailController");
const router = express.Router();

router.post("/subscribe/add", addToMailList);
router.get("/subscribe/getAll", getMailList);

module.exports = router;
