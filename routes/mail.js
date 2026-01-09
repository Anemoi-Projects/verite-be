const express = require("express");
const { addToMailList } = require("../controllers/mailController/mailController");
const router = express.Router();

router.post("/subscribe/submit", addToMailList);


module.exports = router;