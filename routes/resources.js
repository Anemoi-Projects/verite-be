const express = require("express");
const router = express.Router();

const fetchuser = require("../middleware/fetchuser");
const { getAllResources, addResource, editResourceById, deleteResourceById, getResourceById } = require("../controllers/ResourcesControllers/ResourcesControllers");
const upload = require("../upload/multer");

router.get("/getAllResources", getAllResources);
router.get("/getResourceById", getResourceById);
router.post("/addResource", fetchuser, upload.single("pdf"), addResource);
router.put("/editResourceById", fetchuser, upload.single("pdf"), editResourceById);
router.delete("/deleteResourceById", fetchuser, deleteResourceById);

module.exports = router;