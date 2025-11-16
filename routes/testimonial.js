const express = require("express");
const router = express.Router();

const fetchuser = require("../middleware/fetchuser");
const { getTestimonial, createTestimonial, deleteTestimonial, updateTestimonial } = require("../controllers/TestimonialControllers/TestimonialControllers");
const upload = require("../upload/multer");

router.get("/getTestimonial", getTestimonial);
router.post("/createTestimonial", fetchuser, upload.single("backgroundImage"), createTestimonial);
router.delete("/deleteTestimonial", fetchuser, deleteTestimonial);
router.put("/updateTestimonial", fetchuser, upload.single("backgroundImage"), updateTestimonial);

module.exports = router