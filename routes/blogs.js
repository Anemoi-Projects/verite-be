const express = require("express");
const router = express.Router();
const { getBlog, createBlog, editBlog, getAllBlogs, deleteBlog, getAllPublishedBlogs, getBlogBySlug } = require("../controllers/BlogController/BlogController");
const upload = require("../upload/multer");
const fetchuser = require("../middleware/fetchuser");

router.get("/getAllBlogs", getAllBlogs);
router.get("/published/getAllBlogs", getAllPublishedBlogs);
router.get("/getBlog", getBlog);
router.get("/getBlogBySlug", getBlogBySlug);
router.post("/createBlog", fetchuser, upload.fields([{ name: "thumbnail", maxCount: 1 },{ name: "authorImage", maxCount: 1 },]), createBlog);
router.put("/editBlog", fetchuser, upload.fields([{ name: "thumbnail", maxCount: 1 },{ name: "authorImage", maxCount: 1 },]), editBlog)
router.delete("/deleteBlog", fetchuser, deleteBlog)

module.exports = router;