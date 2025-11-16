const { sendErrorResponse } = require("../../handlers/errorHandler/errorHandler");
const Enquiry = require("../../models/Enquiry");


const createEnquiry = async (req,res) => {
    try {
        const { firstName, lastName, emailID } = req.body;

        if (!firstName) return sendErrorResponse(res, 400, "firstName is required");
        if (!lastName) return sendErrorResponse(res, 400, "lastName is required");
        if (!emailID) return sendErrorResponse(res, 400, "emailID is required");

        const enquiry = await Enquiry.create({firstName, lastName, emailID});
        if (!enquiry) return sendErrorResponse(res, 400, "An unknown error occured");

        return res.status(200).json({success: true, data: enquiry});
    } catch (error) {
        console.log(error);
        return res.status(500).json({success: false, data: "Internal Server Error"});
    }
};

const getEnquiry = async (req, res) => {
    try {
        const enquiry = await Enquiry.find();
        if (!enquiry) return sendErrorResponse(res, 404, "No enquires found");

        return res.status(200).json({success: true, data: enquiry});
    } catch (error) {
        console.log(error)
        return res.status(500).json({success: false, data: "Internal Server Error"})
    }
}

const deleteEnquiry = async(req,res) => {
    try {
        const {id} = req.query;
        if (!id) return sendErrorResponse(res, 400, "id is required");

        const enquiry = await Enquiry.findByIdAndDelete(id);
        if (!enquiry) return sendErrorResponse(res, 404, "Enquiry not found");

        return res.status(200).json({success: true, data: "Enquiry deleted successfully"});
    } catch (error) {
        console.log(error)
        return res.status(500).json({success: false, data: "Internal Server Error"})
    }
}

module.exports = { createEnquiry, getEnquiry, deleteEnquiry }