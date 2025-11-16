const express = require("express");
const router = express.Router();

const userAuthHelper = require("../handlers/user/userAuthHelper");
const fetchuser = require("../middleware/fetchuser");
const checkMultipleRoles = require("../middleware/checkrole");
const {
  userRegister,
  userLogin,
  getProfile,
  editProfile,
  deleteProfile,
  editPages,
  createPage,
  updateSection,
  updateSectionAlt,
  updateSubSection,
  dashboardStats,
  editSEO,
  getAllAdmin,
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
  updateAdmin,
  getCategoryById,
  createSection,
  createSubSection,
} = require("../controllers/AdminControllers/AdminControllers");
const upload = require("../upload/multer");

router.post(
  "/register",
  userAuthHelper.userRegisterValidator,
  userAuthHelper.handleValidationErrors,
  // fetchuser,
  // checkMultipleRoles(["superadmin"]),
  userRegister
);

router.post(
  "/login",
  userAuthHelper.userRegisterValidator,
  userAuthHelper.handleValidationErrors,
  userLogin
);

router.get(
  "/getAllAdmin",
  fetchuser,
  checkMultipleRoles(["superadmin"]),
  getAllAdmin
);

router.put(
  "/updateAdmin",
  fetchuser,
  checkMultipleRoles(["superadmin"]),
  userAuthHelper.updateUserValidator,
  userAuthHelper.handleValidationErrors,
  updateAdmin
);

router.get("/getProfile", fetchuser, getProfile);

router.put("/editProfile", fetchuser, editProfile);

router.delete(
  "/delete/:id",
  fetchuser,
  checkMultipleRoles(["superadmin"]),
  deleteProfile
);

router.put("/editPage", fetchuser, editPages);

router.put("/editSEO", fetchuser, editSEO);

router.post("/createPage", fetchuser, createPage);

router.post(
  "/createSection",
  fetchuser,
  upload.fields([
    { name: "sectionMedia", maxCount: 1 },
    { name: "sectionBackground", maxCount: 1 },
  ]),
  createSection
);

router.put(
  "/updateSection",
  fetchuser,
  upload.fields([
    { name: "sectionMedia", maxCount: 1 },
    { name: "sectionBackground", maxCount: 1 },
  ]),
  updateSectionAlt
);

router.post(
  "/createSubSection",
  fetchuser,
  upload.fields([
    { name: "subSectionMedia", maxCount: 1 },
    // { name: "sectionBackground", maxCount: 1 },
  ]),
  createSubSection
);

router.put(
  "/updateSubSection",
  fetchuser,
  upload.fields([
    { name: "subSectionMedia", maxCount: 1 },
    // { name: "sectionBackground", maxCount: 1 },
  ]),
  updateSubSection
);
router.get("/getDashboardStats", fetchuser, dashboardStats);
router.post("/createCategory", fetchuser, createCategory);
router.get("/getAllCategories", getAllCategories);
router.put("/updateCategory", fetchuser, updateCategory);
router.delete("/deleteCategory", fetchuser, deleteCategory);
router.get("/getCategoryById", getCategoryById);

module.exports = router;
