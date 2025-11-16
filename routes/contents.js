const express = require("express");
const router = express.Router();
const upload = require("../upload/multer");

const fetchuser = require("../middleware/fetchuser");
const { getPage, getPages, getAllPages, getHeader, getFooter, editHeader, editFooter, getHeaderById, getFooterById, getFooterSectionById, editFooterSectionById, createFooter, getFooterByKey, editFooterPage, getFooterPage } = require("../controllers/ContentControllers/ContentControllers");

// router.get("/getPage", getPage);
router.get("/getAllPages", getAllPages)
router.get("/getPages", getPages)
router.get("/getHeader", getHeader)
router.put("/editHeader", fetchuser, editHeader)
router.get("/getHeaderById", getHeaderById)
router.get("/getFooter", getFooter);
router.get("/getFooterById", getFooterById);
router.get("/getFooterByKey", getFooterByKey);
router.get("/getFooterSectionById", fetchuser, getFooterSectionById);
router.put("/editFooter", fetchuser, editFooter)
router.put("/editFooterSectionById", fetchuser, editFooterSectionById)
router.post("/createFooter", fetchuser, createFooter);
router.put("/editFooterPage", fetchuser, upload.single("media"), editFooterPage);
router.get("/getFooterPage", getFooterPage);

module.exports = router;
