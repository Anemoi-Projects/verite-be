const express = require("express");
const {
  getMember,
  updateMember,
  deleteMember,
  createMember,
} = require("../controllers/TeamControllers/TeamControllers");
const fetchuser = require("../middleware/fetchuser");
const checkMultipleRoles = require("../middleware/checkrole");
const upload = require("../upload/multer");
const router = express.Router();

router.post(
  "/createMember",
  fetchuser,
  checkMultipleRoles(["superadmin", "admin"]),
  upload.single("picture"),
  createMember
);
router.get("/getMembers", getMember);
router.put(
  "/updateMember",
  fetchuser,
  checkMultipleRoles(["superadmin", "admin"]),
  upload.single("picture"),
  updateMember
);
router.delete(
  "/deleteMember",
  fetchuser,
  checkMultipleRoles(["superadmin", "admin"]),
  deleteMember
);

module.exports = router;
