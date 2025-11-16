const express = require("express");
const fetchuser = require("../middleware/fetchuser");
const checkMultipleRoles = require("../middleware/checkrole");
const { createPartner, getPartner, updatePartner, deletePartner } = require("../controllers/PartnerControllers/PartnerControllers");
const upload = require("../upload/multer");
const router = express.Router();

router.post("/createPartner", fetchuser, checkMultipleRoles(["superadmin", "admin"]), upload.single("logo"), createPartner);
router.get("/getPartner", getPartner)
router.put("/updatePartner", fetchuser, checkMultipleRoles(["superadmin", "admin"]), upload.single("logo"), updatePartner);
router.delete("/deletePartner", fetchuser, checkMultipleRoles(["superadmin", "admin"]), deletePartner);

module.exports = router