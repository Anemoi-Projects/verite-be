const express = require("express");
const router = express.Router();

const fetchuser = require("../middleware/fetchuser");
const { getAllFAQ, createFAQ, deleteFAQ, editFAQ, getFAQ } = require("../controllers/FAQControllers/FAQControllers");

router.get("/getAllFAQ", getAllFAQ);
router.get("/getFAQ", getFAQ)
router.post("/createFAQ", fetchuser, createFAQ);
router.delete("/deleteFAQ", fetchuser, deleteFAQ);
router.put("/editFAQ", fetchuser, editFAQ);

module.exports = router;