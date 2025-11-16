const express = require("express");
const router = express.Router();
const fetchuser = require("../middleware/fetchuser");
const checkMultipleRoles = require("../middleware/checkrole");
const { createEnquiry, getEnquiry, deleteEnquiry } = require("../controllers/EnquiryControllers/EnquiryControllers");

router.post("/createEnquiry", createEnquiry);
router.get("/getEnquiry", fetchuser, checkMultipleRoles("superadmin", "admin"), getEnquiry);
router.delete("/deleteEnquiry", fetchuser, checkMultipleRoles("superadmin", "admin"), deleteEnquiry);

module.exports = router;