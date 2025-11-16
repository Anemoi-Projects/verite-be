const { default: mongoose } = require("mongoose");
const Admin = require("../../models/Admin");
const Team = require("../../models/Team");
const cloudinary = require('../../upload/cloudinary');
const fs = require('fs');
const { sendErrorResponse } = require("../../handlers/errorHandler/errorHandler");

const createMember = async (req, res) => {
    try {
        const admin = await Admin.findById(req.user.id);
        if (!admin) return sendErrorResponse(res, 404, "Admin not found");

        const { lang, type } = req.query;
        if (!lang) return sendErrorResponse(res, 400, "Lang is required");
        const { name, designation, linkedIn } = req.body;
        if (!name) return sendErrorResponse(res, 400, "Name is required");
        if (!designation) return sendErrorResponse(res, 400, "Designation is required");
        if (!type) return sendErrorResponse(res, 400, "Type is required");

        const data = {
            designation: {},
        };

        data.name = name;
        data.designation[lang || "en"] = designation;
        data.type = type;
        if(linkedIn) data.linkedIn = linkedIn;

        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: `${type}/${name}`, // Store in 'sections' folder
            });
            data.picture = result.secure_url;
            data.public_id = result.public_id

            // Optional: delete the local temp file after upload
            fs.unlinkSync(req.file.path);
        }

        const newMember = await Team.create(data);

        return res.status(200).json({ success: true, data: newMember });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, data: "Internal Server Error" });
    }
};

const getMember = async (req, res) => {
    try {
        const { id, type, lang = "en" } = req.query;
        if (!type) sendErrorResponse(res, 400, "Team type is required");

        let member;

        if (id) {
            const agg = [
                {
                    $match: {
                        _id: new mongoose.Types.ObjectId(id)
                    }
                },
                {
                    $project: {
                        name: 1,
                        designation: { $ifNull: [`$designation.${lang}`, `$designation.en`] },
                        picture: 1,
                        linkedIn: 1,
                        type: 1
                    }
                }
            ];

            const result = await Team.aggregate(agg);

            if (!result || result.length === 0) {
                return sendErrorResponse(res, 404, `No member found for ID: ${id}`);
            }

            return res.status(200).json({ success: true, data: result[0] });
        }

        const agg = [
             {
                    $match: {
                        type: type
                    }
                },
            {
            $project:
            /**
             * specifications: The fields to
             *   include or exclude.
             */
            {
                name: 1,
                designation: { $ifNull: [`$designation.${lang}`, `$designation.en`] },
                picture: 1,
                linkedIn: 1,
                type: 1
            }
        }
    ]

        member = await Team.aggregate(agg);

        if (!member || member.length === 0) return sendErrorResponse(res, 404, "No members found");

        return res.status(200).json({ success: true, data: member });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, data: "Internal Server Error" });
    }
};

const updateMember = async (req, res) => {
    try {
        const admin = await Admin.findById(req.user.id);
        if (!admin) return sendErrorResponse(res, 404, "Admin not found");

        const { lang, id, type } = req.query;
        const { name, designation, linkedIn } = req.body;

        if (!lang) return sendErrorResponse(res, 400, "Language code is required");
        if (!id) return sendErrorResponse(res, 400, "Member ID is required");

        const updateData = {};

        // Set plain name if provided
        if (name) updateData.name = name;
        if(linkedIn) updateData.linkedIn = linkedIn;

        // Set designation in specified language
        if (designation) {
            updateData[`designation.${lang}`] = designation;
        }

        // Handle file upload if a new picture is provided
        if (req.file) {
            const existingMember = await Team.findById(id);
            if (!existingMember) return sendErrorResponse(res, 404, "Member not found");

            // Delete old image from Cloudinary
            if (existingMember.public_id) {
                await cloudinary.uploader.destroy(existingMember.public_id);
            }

            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: `${type}/${existingMember.name || 'member'}`
            });

            updateData.picture = result.secure_url;
            updateData.public_id = result.public_id;

            fs.unlinkSync(req.file.path);
        }

        const updatedMember = await Team.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!updatedMember) return sendErrorResponse(res, 404, "Failed to update member");

        return res.status(200).json({ success: true, data: updatedMember });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, data: "Internal Server Error" });
    }
};

const deleteMember = async (req, res) => {
    try {
        const { id } = req.query;
        if (!id) return sendErrorResponse(res, 404, "ID is required");

        const member = await Team.findByIdAndDelete(id);
        if (!member) return sendErrorResponse(res, 404, `No member found for ${id}`);

        return res.status(200).json({ success: true, data: "Successfully deleted member" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, data: "Internal Server Error" });
    }
}


module.exports = { createMember, getMember, updateMember, deleteMember }