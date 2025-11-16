const Admin = require("../../models/Admin");
const {
  sendErrorResponse,
} = require("../../handlers/errorHandler/errorHandler");
require("dotenv").config();
const logger = require("../../logger/logger");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { format } = require("date-fns");
const cloudinary = require("../../upload/cloudinary");

const Pages = require("../../models/Pages");
const Sections = require("../../models/Sections");
const SubSections = require("../../models/Subsections");
const Blogs = require("../../models/Blogs");
const Categories = require("../../models/Category");

const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email) sendErrorResponse(res, 400, "Email is required");
    if (!password) sendErrorResponse(res, 400, "Password is required");

    let admin = await Admin.findOne({ emailId: email }).select("+password");
    if (!admin) {
      return sendErrorResponse(res, 400, "Invalid Email Id or Password");
    }
    const isPasswordCorrect = await bcrypt.compare(password, admin.password);
    if (!isPasswordCorrect) {
      return sendErrorResponse(res, 400, "Invalid Email Id or Password");
    }
    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET
      // { expiresIn: "1h" }
    );
    return res.status(200).json({ success: true, data: token });
  } catch (error) {
    console.log(error);
    return sendErrorResponse(res, 500, "Internal Server Error");
  }
};

const userRegister = async (req, res) => {
  try {
    const { email, password, fullName } = req.body;
    let admin = await Admin.findOne({ emailId: email });
    if (admin) {
      return res
        .status(400)
        .json({ success: false, data: "Admin already exists" });
    }
    let hashedPassword = await bcrypt.hash(password, 10);
    await Admin.create({
      emailId: email.toLowerCase(),
      password: hashedPassword,
      fullName: fullName,
      role: "admin",
      verified: true,
    });
    return res.status(200).json({ success: true, data: "Admin Registered" });
  } catch (error) {
    logger.error(error.message);
    return sendErrorResponse(res, 500, "Internal Server Error");
  }
};

const updateAdmin = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) return sendErrorResponse(res, 400, "id is required");
    const { email, password, fullName } = req.body;
    if (email === "")
      return sendErrorResponse(res, 400, "Cannot set empty email");
    if (password === "")
      return sendErrorResponse(res, 400, "Cannot set empty password");
    if (fullName === "")
      return sendErrorResponse(res, 400, "Cannot set empty fullName");

    const admin = await Admin.findById(id);
    if (!updateAdmin) return sendErrorResponse(res, 404, "Admin not found");

    let newData;
    let hashedPassword;

    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    if (email) {
      admin.emailId = email;
    }

    if (hashedPassword && password) {
      admin.password = hashedPassword;
    }

    if (fullName) {
      admin.fullName = fullName;
    }

    await admin.save();

    return res
      .status(200)
      .json({ success: true, data: "Successfully updated admin" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, data: "Internal Server Error" });
  }
};

const getAllAdmin = async (req, res) => {
  try {
    const admins = await Admin.find({ role: "admin" });
    return res.status(200).json({ success: true, data: admins });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, data: "Internal Server Error" });
  }
};

const getProfile = async (req, res) => {
  try {
    let admin = await Admin.findById(req.user.id);
    if (!admin) {
      return sendErrorResponse(res, 400, "Admin not found");
    }
    return res.status(200).json({ success: true, data: admin });
  } catch (error) {
    console.log(error);
    return sendErrorResponse(res, 500, "Internal Server Error");
  }
};

const editProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id);
    if (!admin) {
      return sendErrorResponse(res, 400, "Admin not found");
    }
    const { fullName, phoneNumber, dob, city, country } = req.body;

    if (fullName) admin.fullName = fullName;
    if (phoneNumber) {
      if (phoneNumber.length !== 10) {
        return sendErrorResponse(res, 400, "Invalid Phone Number");
      }
      admin.phoneNumber = phoneNumber;
    }
    if (dob) {
      const parsedDob = new Date(format(dob, "yyyy-MM-dd"));
      admin.dob = new Date(parsedDob);
    }
    if (city) admin.city = city;
    if (country) admin.country = country;

    await admin.save();

    return res.status(200).json({ success: true, message: "Profile Updated" });
  } catch (error) {
    return sendErrorResponse(res, 500, "Internal Server Error");
  }
};

const deleteProfile = async (req, res) => {
  try {
    const admin = await Admin.findByIdAndDelete(req.params.id);
    if (!admin) return sendErrorResponse(res, 404, "Admin not found");
    return res
      .status(200)
      .json({ success: true, data: "Admin Deleted Successfully" });
  } catch (error) {
    console.log(error);
    return sendErrorResponse(res, 500, "Internal Server Error");
  }
};

const createPage = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id);
    if (!admin) return sendErrorResponse(res, 404, "Admin not found");
    const { name, path, meta, sections } = req.body;
    const page = await Pages.create({
      name: name,
      path: path,
      meta: meta,
    });

    // for (const section of sections) {
    //     await Sections.create({
    //         ...section,
    //         pageId: page.id, // if there's a foreign key relation
    //     });
    // };
    for (const section of sections) {
      const { subsections, ...sectionData } = section;

      // 2.1 Create section with link to page
      const createdSection = await Sections.create({
        ...sectionData,
        pageId: page._id,
      });

      // 2.2 If there are subsections, create them
      if (Array.isArray(subsections)) {
        for (const subsection of subsections) {
          await SubSections.create({
            ...subsection,
            sectionId: createdSection._id,
          });
        }
      }
    }

    return res
      .status(200)
      .json({ success: true, data: "Page created succesfully" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, data: "Internal Server Error" });
  }
};

const editPages = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id);
    if (!admin) return sendErrorResponse(res, 404, "Admin not found");

    const { pageID } = req.query;
    if (!pageID) return sendErrorResponse(res, 400, "pageID is required");

    const {
      name,
      path,
      meta,
      sections,
      seoTitle,
      seoDescription,
      seoKeywords,
      tags,
      ogTitle,
      ogDescription,
      published,
    } = req.body;

    const page = await Pages.findById(pageID);
    if (!page) return sendErrorResponse(res, 404, "Page not found");

    if (name) page.name = name;
    if (path) page.path = path;
    if (meta) page.meta = meta;
    if (sections) page.sections = sections;
    if (seoTitle) page.seoTitle = seoTitle;
    if (seoDescription) page.seoDescription = seoDescription;
    if (seoKeywords) page.seoKeywords = seoKeywords;
    if (tags) page.tags = tags;
    if (ogTitle) page.ogTitle = ogTitle;
    if (ogDescription) page.ogDescription = ogDescription;
    if (published) page.published = published;

    await page.save();
    return res.status(200).json({ success: true, data: page });
  } catch (error) {
    return sendErrorResponse(res, 500, "Internal Server Error");
  }
};

const editSEO = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id);
    if (!admin) return sendErrorResponse(res, 404, "Admin not found");

    const { pageID } = req.query;
    if (!pageID) return sendErrorResponse(res, 400, "pageID is required");

    const {
      name,
      seoTitle,
      seoDescription,
      seoKeywords,
      tags,
      ogTitle,
      ogDescription,
    } = req.body;

    const page = await Pages.findById(pageID);
    if (!page) return sendErrorResponse(res, 404, "Page not found");

    if (seoTitle) page.seoTitle = seoTitle;
    if (seoDescription) page.seoDescription = seoDescription;
    if (seoKeywords) page.seoKeywords = seoKeywords;
    if (tags) page.tags = tags;
    if (ogTitle) page.ogTitle = ogTitle;
    if (ogDescription) page.ogDescription = ogDescription;

    await page.save();
    return res.status(200).json({ success: true, data: page });
  } catch (error) {
    return sendErrorResponse(res, 500, "Internal Server Error");
  }
};

const createSection = async (req, res) => {
  try {
    const { pageId, theme } = req.query;

    if (!pageId) {
      return res
        .status(400)
        .json({ error: true, message: "pageId is required" });
    }

    if (theme && !["light", "dark"].includes(theme)) {
      return res.status(400).json({
        error: true,
        message: "theme must be 'light' or 'dark'",
      });
    }

    const {
      headline,
      subHeadline,
      description,
      ctaButton,
      ctaLink,
      disabled,
      order,
    } = req.body;

    let sectionMedia = "";
    let mediaType = "";

    // Background object with both keys
    let sectionBackground = {
      light: "",
      dark: "",
    };

    // -----------------------------
    // UPLOAD sectionMedia (image/video)
    // -----------------------------
    if (req.files?.sectionMedia?.[0]) {
      const file = req.files.sectionMedia[0];

      const resourceType = file.mimetype.startsWith("video/")
        ? "video"
        : file.mimetype.startsWith("image/")
        ? "image"
        : "auto";

      const uploadedMedia = await cloudinary.uploader.upload(file.path, {
        folder: "sections/media",
        resource_type: resourceType,
      });

      sectionMedia = uploadedMedia.secure_url;
      mediaType = file.mimetype;
    }

    // -----------------------------
    // UPLOAD sectionBackground (image only)
    // -----------------------------
    if (req.files?.sectionBackground?.[0]) {
      const bgFile = req.files.sectionBackground[0];

      if (!bgFile.mimetype.startsWith("image/")) {
        return res.status(400).json({
          error: true,
          message: "sectionBackground must be an image",
        });
      }

      const bgFolder = `sections/background/${theme}`;

      const uploadedBg = await cloudinary.uploader.upload(bgFile.path, {
        folder: bgFolder,
        resource_type: "image",
      });
      sectionBackground[theme] = uploadedBg.secure_url;
    }

    // -----------------------------
    // CREATE THE NEW SECTION
    // -----------------------------
    const newSection = await Sections.create({
      headline: headline || "",
      subHeadline: subHeadline || "",
      description: description || "",
      ctaButton: ctaButton || "",
      ctaLink: ctaLink || "",
      sectionMedia: sectionMedia || "",
      mediaType: mediaType || "",
      sectionBackground,
      pageId,
      disabled: disabled ?? false,
      order: order || null,
    });

    return res.status(201).json({
      success: true,
      data: newSection,
    });
  } catch (error) {
    console.error("Create Section Error:", error);
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
};

const updateSectionAlt = async (req, res) => {
  try {
    const { sectionId, theme } = req.query;
    console.log(sectionId);

    if (!sectionId) {
      return res
        .status(400)
        .json({ error: true, message: "sectionId is required" });
    }

    if (theme && !["light", "dark"].includes(theme)) {
      return res.status(400).json({
        error: true,
        message: "theme must be 'light' or 'dark'",
      });
    }

    const { headline, subHeadline, description, ctaButton, ctaLink, disabled } =
      req.body;

    let updateData = {};

    // --------------------------
    // TEXT FIELD UPDATES
    // --------------------------
    if (headline !== undefined) updateData.headline = headline;
    if (subHeadline !== undefined) updateData.subHeadline = subHeadline;
    if (description !== undefined) updateData.description = description;
    if (ctaButton !== undefined) updateData.ctaButton = ctaButton;
    if (ctaLink !== undefined) updateData.ctaLink = ctaLink;
    if (disabled !== undefined) updateData.disabled = disabled;

    // --------------------------
    // MEDIA UPDATE (image/video)
    // --------------------------
    if (req.files?.sectionMedia?.[0]) {
      const file = req.files.sectionMedia[0];

      const resourceType = file.mimetype.startsWith("video/")
        ? "video"
        : file.mimetype.startsWith("image/")
        ? "image"
        : "auto";

      const uploadedMedia = await cloudinary.uploader.upload(file.path, {
        folder: "sections/media",
        resource_type: resourceType,
      });

      updateData.sectionMedia = uploadedMedia.secure_url;
      updateData.mediaType = file.mimetype;
    }

    // --------------------------
    // BACKGROUND UPDATE (light/dark)
    // --------------------------
    if (req.files?.sectionBackground?.[0]) {
      const bgFile = req.files.sectionBackground[0];

      if (!bgFile.mimetype.startsWith("image/")) {
        return res.status(400).json({
          error: true,
          message: "sectionBackground must be an image",
        });
      }

      let folder = "sections/background/general";
      if (theme) {
        folder = `sections/background/${theme}`;
      }

      const uploadedBg = await cloudinary.uploader.upload(bgFile.path, {
        folder,
        resource_type: "image",
      });

      // Insert into correct object key
      updateData[`sectionBackground.${theme}`] = uploadedBg.secure_url;
    }

    // --------------------------
    // UPDATE THE DOCUMENT
    // --------------------------
    const updated = await Sections.findByIdAndUpdate(sectionId, updateData, {
      new: true,
    });

    if (!updated) {
      return res
        .status(404)
        .json({ error: true, message: "Section not found" });
    }

    return res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error("Update Section Error:", error);
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
};
const createSubSection = async (req, res) => {
  try {
    const { sectionId } = req.query;

    if (!sectionId) {
      return res
        .status(400)
        .json({ error: true, message: "sectionId is required" });
    }

    const { heading, subHeading, description, ctaButton, ctaLink, order } =
      req.body;

    let subSectionMedia = null;
    let mediaType = null;

    // -----------------------------
    // UPLOAD MEDIA IF PROVIDED
    // -----------------------------
    const fileObj = req.files?.subSectionMedia?.[0] || null;

    if (fileObj) {
      const resourceType = fileObj.mimetype.startsWith("video/")
        ? "raw"
        : fileObj.mimetype.startsWith("image/")
        ? "image"
        : "auto";

      const uploaded = await cloudinary.uploader.upload(fileObj.path, {
        folder: "subsections",
        resource_type: resourceType,
      });

      subSectionMedia = uploaded.secure_url;
      mediaType = fileObj.mimetype;
    }

    // -----------------------------
    // CREATE SUBSECTION DOCUMENT
    // -----------------------------
    const newSubSection = await SubSections.create({
      heading: heading || "",
      subHeading: subHeading || "",
      description: description || "",
      ctaButton: ctaButton || "",
      ctaLink: ctaLink || "",
      subSectionMedia: subSectionMedia,
      mediaType: mediaType,
      sectionId: sectionId,
      order,
    });

    return res.status(201).json({
      success: true,
      data: newSubSection,
    });
  } catch (error) {
    console.error("Create SubSection Error:", error);
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
};

const updateSubSection = async (req, res) => {
  try {
    const { subSectionId } = req.query;

    if (!subSectionId) {
      return res.status(400).json({
        error: true,
        message: "subSectionId is required",
      });
    }

    const { heading, subHeading, description, ctaButton, ctaLink } = req.body;

    let updateData = {};
    let mediaUrl = null;
    let mimeType = null;

    // -----------------------------
    // HANDLE MEDIA UPLOAD IF FILE PROVIDED
    // -----------------------------
    const fileObj = req.files?.subSectionMedia?.[0] || null;

    if (fileObj) {
      const resourceType = fileObj.mimetype.startsWith("video/")
        ? "raw"
        : fileObj.mimetype.startsWith("image/")
        ? "image"
        : "auto";

      const uploaded = await cloudinary.uploader.upload(fileObj.path, {
        folder: "subsections",
        resource_type: resourceType,
      });

      mediaUrl = uploaded.secure_url;
      mimeType = fileObj.mimetype;
    }

    // -----------------------------
    // TEXT FIELD UPDATES
    // -----------------------------
    if (heading !== undefined) updateData.heading = heading;
    if (subHeading !== undefined) updateData.subHeading = subHeading;
    if (description !== undefined) updateData.description = description;
    if (ctaButton !== undefined) updateData.ctaButton = ctaButton;
    if (ctaLink !== undefined) updateData.ctaLink = ctaLink;

    // -----------------------------
    // HANDLE DELETING MEDIA
    // -----------------------------
    if (req.body.image === "null") {
      updateData.subSectionMedia = null;
      updateData.mediaType = null;
    }

    // -----------------------------
    // HANDLE ADDING NEW MEDIA
    // -----------------------------
    if (mediaUrl) {
      updateData.subSectionMedia = mediaUrl;
      updateData.mediaType = mimeType;
    }

    // -----------------------------
    // UPDATE SUBSECTION
    // -----------------------------
    const updated = await SubSections.findByIdAndUpdate(
      subSectionId,
      updateData,
      {
        new: true,
      }
    );

    if (!updated) {
      return res.status(404).json({
        error: true,
        message: "Subsection not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error("Update SubSection Error:", error);
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
};

const dashboardStats = async (req, res) => {
  try {
    let stats;
    const pages = await Pages.find();
    const blogs = await Blogs.find();
    const accounts = await Admin.find();

    return res.status(200).json({
      success: true,
      data: {
        pages: pages.length,
        blogs: blogs.length,
        accounts: accounts.length,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, data: "Internal Server Error" });
  }
};

const createCategory = async (req, res) => {
  try {
    const { lang } = req.query;
    const { name, slug } = req.body;
    if (!name) return sendErrorResponse(res, 400, "name is required");
    if (!slug) return sendErrorResponse(res, 400, "slug is required");
    if (!lang) return sendErrorResponse(res, 400, "lang is required");

    const category = await Categories.create({ name, slug, lang });

    return res.status(200).json({ success: true, data: category });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, data: "Internal Server Error" });
  }
};

// const associateCategory = async(req,res) => {
//     try {
//         const { slug } = req.body;
//         if (!slug) return sendErrorResponse(res, 400, "slug is required");

//         const { categoryID } = req.query
//         if (!categoryID) return sendErrorResponse(res, 400, "categoryID is required");

//         const category = await Categories.findOneAndUpdate(categoryID, {$set: {slug: slug}});
//         if (!category) return sendErrorResponse(res, 404, "Category not found");

//         return res.status(200).json({success: true, data: category});
//     } catch (error) {
//         return res.status(500).json({success: false, data: "Internal Server Error"});
//     }
// }

const getAllCategories = async (req, res) => {
  try {
    const { slug, lang } = req.query;
    if (!slug) return sendErrorResponse(res, 400, "slug is required");
    if (!lang) return sendErrorResponse(res, 400, "lang is required");
    const categories = await Categories.find({ slug: slug, lang: lang });
    if (!categories)
      return sendErrorResponse(res, 404, "There are no categories");
    return res.status(200).json({ success: true, data: categories });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, data: "Internal Server Error" });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id, lang } = req.query;
    const { name } = req.body;
    if (!id) return sendErrorResponse(res, 400, "id is required");
    if (!lang) return sendErrorResponse(res, 400, "lang is required");

    const updateCategory = await Categories.findByIdAndUpdate(
      id,
      { $set: { name: name } },
      { new: true }
    );
    if (!updateCategory)
      return sendErrorResponse(res, 404, "Category not found");

    return res.status(200).json({ success: true, data: updateCategory });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, data: "Internal Server Error" });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) return sendErrorResponse(res, 400, "id is required");

    const category = await Categories.findByIdAndDelete(id);
    if (!category) return sendErrorResponse(res, 404, "Category not found");

    return res
      .status(200)
      .json({ success: true, data: "Successfully deleted category" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, data: "Internal Server Error" });
  }
};

const getCategoryById = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) return sendErrorResponse(res, 400, "lang is required");

    const category = await Categories.findById(id);
    if (!category) return sendErrorResponse(res, 404, "Category not found");

    return res.status(200).json({ success: true, data: category });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, data: "Internal Server Error" });
  }
};

module.exports = {
  userRegister,
  userLogin,
  getProfile,
  editProfile,
  deleteProfile,
  createPage,
  editPages,
  createSection,
  updateSectionAlt,
  createSubSection,
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
};
