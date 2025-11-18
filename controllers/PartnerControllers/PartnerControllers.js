const {
  sendErrorResponse,
} = require("../../handlers/errorHandler/errorHandler");
const Partner = require("../../models/partner");
const cloudinary = require("../../upload/cloudinary");
const fs = require("fs");

const createPartner = async (req, res) => {
  try {
    const { name, url } = req.body;
    if (!name) return sendErrorResponse(res, 400, "Name is required");

    let data = {};
    data.name = name;
    if (url) data.url = url;
    const safeFolderName = name
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-_]/g, "");
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: `partners/${safeFolderName}`,
      });
      data.logo = result.secure_url;
      data.public_id = result.public_id;

      // Optional: delete the local temp file after upload
      fs.unlinkSync(req.file.path);
    }

    const partner = await Partner.create(data);

    return res.status(200).json({ success: true, data: partner });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, data: "Internal Server Error" });
  }
};

const getPartner = async (req, res) => {
  try {
    const { id } = req.query;

    let partner;

    if (id) {
      partner = await Partner.findById(id);
      if (!partner)
        return sendErrorResponse(res, 404, `Parter not found for ${id}`);

      return res.status(200).json({ success: true, data: partner });
    }

    partner = await Partner.find();
    if (!partner) return sendErrorResponse(res, 404, "No partners found");

    return res.status(200).json({ success: true, data: partner });
  } catch (error) {
    console.log(error);
    return sendErrorResponse(res, 500, "Internal Server Error");
  }
};

const updatePartner = async (req, res) => {
  try {
    const { id } = req.query;
    const { name, url } = req.body;

    if (!id) return sendErrorResponse(res, 400, "Partner ID is required");

    const partner = await Partner.findById(id);
    if (!partner) return sendErrorResponse(res, 404, "Partner not found");

    if (name) partner.name = name;
    if (url) partner.url = url;

    if (req.file) {
      // Delete old Cloudinary image
      if (partner.public_id) {
        await cloudinary.uploader.destroy(partner.public_id);
      }

      const safeFolderName = (name || partner.name)
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-_]/g, "");

      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: `partners/${safeFolderName}`,
      });

      partner.logo = result.secure_url;
      partner.public_id = result.public_id;

      fs.unlinkSync(req.file.path);
    }

    await partner.save();

    return res.status(200).json({ success: true, data: partner });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, data: "Internal Server Error" });
  }
};

const deletePartner = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) return sendErrorResponse(res, 400, "Partner ID is required");

    const partner = await Partner.findByIdAndDelete(id);
    if (!partner)
      return sendErrorResponse(res, 404, `Partner not found for ${id}`);

    return res
      .status(200)
      .json({ success: true, data: "Partner deleted successfully" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, data: "Internal Server Error" });
  }
};

module.exports = { createPartner, updatePartner, getPartner, deletePartner };
