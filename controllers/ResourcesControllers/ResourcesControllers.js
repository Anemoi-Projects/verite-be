const express = require("express");
const Resources = require("../../models/Resources");
const { sendErrorResponse } = require("../../handlers/errorHandler/errorHandler");
const cloudinary = require('../../upload/cloudinary');
const { default: mongoose } = require("mongoose");

const getAllResources = async (req, res) => {
    try {
        const { lang } = req.query
        if (!lang) return sendErrorResponse(res, 400, "lang is required")

        const agg = [
            {
                $match:
                /**
                 * query: The query in MQL.
                 */
                {
                    lang: lang
                }
            },
            {
                $lookup:
                /**
                 * from: The target collection.
                 * localField: The local join field.
                 * foreignField: The target join field.
                 * as: The name for the results.
                 * pipeline: Optional pipeline to run on the foreign collection.
                 * let: Optional variables to use in the pipeline field stages.
                 */
                {
                    from: "categories",
                    localField: "tag",
                    foreignField: "_id",
                    as: "categories"
                }
            },
            {
                $project:
                /**
                 * specifications: The fields to
                 *   include or exclude.
                 */
                {
                    _id: 1,
                    title: 1,
                    buttonName: 1,
                    tag: 1,
                    url: 1,
                    cloudinary_publicID: 1,
                    lang: 1,
                    categories: "$categories.name"
                }
            }
        ]

        const resources = await Resources.aggregate(agg);
        return res.status(200).json({ success: true, data: resources })
    } catch (error) {
        return res.status(500).json({ success: false, data: "Internal Server Error" });
    };
};

const addResource = async (req, res) => {
    try {
        const { lang } = req.query;
        if (!lang) return sendErrorResponse(res, 400, "lang is required");

        const { title, buttonName } = req.body;

        if (!title) return sendErrorResponse(res, 400, "title is required");
        if (!buttonName) return sendErrorResponse(res, 400, "buttonName is required");

        let pdfUrl;
        let publicID;

        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: `resources/${title}`,
                resource_type: 'raw'

            });
            pdfUrl = result.secure_url;
            publicID = result.public_id;

            // Optional: delete the local temp file after upload
            //   fs.unlinkSync(req.file.path);
        };

        let categories = [];
        if (req.body.tag) {
            try {
                const parsed = JSON.parse(req.body.tag);

                parsed.forEach(tagID => {
                    categories.push(tagID);
                });

            } catch (err) {
                return res.status(400).json({ error: 'Invalid categories JSON' });
            }
        }


        const newData = {
            title: title,
            buttonName: buttonName,
            tag: categories,
            lang: lang
        };

        if (pdfUrl != "" || null) {
            newData.url = pdfUrl;
        };

        if (publicID) {
            newData.cloudinary_publicID = publicID;
        };

        const resource = await Resources.create(newData);
        if (!resource) return sendErrorResponse(res, 400, "Failed to create resource")

        return res.status(200).json({ success: true, data: resource })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ success: false, data: "Internal Server Error" });
    }
};

const editResourceById = async (req, res) => {
    try {
        const { id, lang } = req.query;
        if (!lang) return sendErrorResponse(res, 400, "lang is required");
        if (!id) return sendErrorResponse(res, 400, "id is required");

        const { title, buttonName } = req.body;

        const resource = await Resources.findById(id);
        if (!resource) return sendErrorResponse(res, 404, "Resource not found");


        let pdfUrl;
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: `resources/${title}`

            });
            pdfUrl = result.secure_url;

            // Optional: delete the local temp file after upload
            //   fs.unlinkSync(req.file.path);
        };

        let categories = [];
        if (req.body.tag) {
            try {
                const parsed = JSON.parse(req.body.tag);

                parsed.forEach(tagID => {
                    categories.push(tagID);
                });

            } catch (err) {
                return res.status(400).json({ error: 'Invalid categories JSON' });
            }
        };

        const updateData = {
            title: title,
            buttonName: buttonName,
            tag: categories,
        };

        if (pdfUrl) {
            updateData.url = pdfUrl;
        };

        const updateResource = await Resources.findByIdAndUpdate(id, updateData);
        if (!resource) return sendErrorResponse(res, 404, "Resource not found")

        return res.status(200).json({ success: true, data: updateResource })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ success: false, data: "Internal Server Error" });
    };
};

const deleteResourceById = async (req, res) => {
    try {
        const { id } = req.query;
        if (!id) return sendErrorResponse(res, 400, "id is required");

        const resource = await Resources.findByIdAndDelete(id);
        if (!resource) return sendErrorResponse(res, 404, "Resource not found");

        if (resource.cloudinary_publicID) {
            await cloudinary.uploader.destroy(resource.cloudinary_publicID);
        }

        return res.status(200).json({ success: true, data: "Successfully deleted resource!" })
    } catch (error) {
        return res.status(500).json({ success: false, data: "Internal Server Error" });
    }
}

const getResourceById = async (req, res) => {
    try {
        const { id, lang } = req.query;
        if (!id) return sendErrorResponse(res, 400, "id is required");
        // if (!lang) return sendErrorResponse(res, 400, "lang is required");

        const resource = await Resources.findOne({ _id: id });
        if (!resource) return sendErrorResponse(res, 404, "Resource not found");

        return res.status(200).json({ success: true, data: resource });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ success: false, data: "Internal Server Error" });
    };
};

module.exports = { getAllResources, addResource, editResourceById, deleteResourceById, getResourceById }