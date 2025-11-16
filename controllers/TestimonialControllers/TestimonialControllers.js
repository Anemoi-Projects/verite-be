const { default: mongoose } = require("mongoose");

const {
    sendErrorResponse,
} = require("../../handlers/errorHandler/errorHandler");
const Testimonial = require("../../models/Testimonial");
const cloudinary = require("../../upload/cloudinary");


const getTestimonial = async (req, res) => {
    try {
        const testimonial = await Testimonial.find();
        if (!testimonial) return sendErrorResponse(res, 400, "Testimonials not found");

        return res.status(200).json({ success: true, data: testimonial });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, data: "Internal Server Error" });
    };
};

const createTestimonial = async (req, res) => {
    try {
        const { customerName, customerDesignation, customerReview } = req.body;

        let imageUrl;
        let public_id;

        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: "testimonials/backgroundImage", // Store in 'testimonials/backgroundImage' folder
            });
            imageUrl = result.secure_url;
            public_id = result.public_id;

            // Optional: delete the local temp file after upload
            //   fs.unlinkSync(req.file.path);
        };

        let data = {};

        if (customerName) {
            data.customerName = customerName;
        };

        if (customerDesignation) {
            data.customerDesignation = customerDesignation;
        };

        if (customerReview) {
            data.customerReview = customerReview;
        };

        if (imageUrl) {
            data.backgroundImage = imageUrl;
        };
        if(public_id) {
            data.public_id = public_id
        }

        const createData = await Testimonial.create(data);

        if (!createData) return sendErrorResponse(res, 400, "Failed to create Testimonial");

        return res.status(200).json({ success: true, data: createData });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, data: "Internal Server Error" });
    }
}

const deleteTestimonial = async (req, res) => {
    try {
        const { id } = req.query;
        if (!id) return sendErrorResponse(res, 400, "id is required");

        const data = await Testimonial.findById(id);

        if (data.public_id) {
            await cloudinary.uploader.destroy(data.public_id);
        }
        
        if (!data) return sendErrorResponse(res, 400, "Cannot find testimonial");

        await data.deleteOne();

        return res.status(200).json({ success: true, data: "Sucessfully deleted testimonial" })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, data: "Internal Server Error" });
    }
}

const updateTestimonial = async (req, res) => {
    try {
        const { id } = req.query;
        if (!id) return sendErrorResponse(res, 400, "id is required");

        const testimonial = await Testimonial.findById(id);
        if (!testimonial) return sendErrorResponse(res, 404, "Testimonial not found");

        const { customerName, customerDesignation, customerReview } = req.body

        let imageUrl;
        let public_id;

        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: "testimonials/backgroundImage", // Store in 'testimonials/backgroundImage' folder
            });
            imageUrl = result.secure_url;
            public_id = result.public_id

            // Optional: delete the local temp file after upload
            //   fs.unlinkSync(req.file.path);
        }

        if (testimonial.public_id) {
            await cloudinary.uploader.destroy(testimonial.public_id);
        }

        if (customerName) {
            testimonial.customerName = customerName;
        };

        if (customerDesignation) {
            testimonial.customerDesignation = customerDesignation;
        };

        if (customerReview) {
            testimonial.customerReview = customerReview;
        };

        if (imageUrl) {
            testimonial.backgroundImage = imageUrl;
        };
        if(public_id) {
            testimonial.public_id = public_id
        };

        await testimonial.save();

        return res.status(200).json({ success: true, data: testimonial });


    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, data: "Internal Server Error" });
    }
}

module.exports = { getTestimonial, createTestimonial, deleteTestimonial, updateTestimonial };