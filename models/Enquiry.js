const { default: mongoose, Schema } = require("mongoose");

const EnquirySchema = new Schema (
    {
        firstName: {
            type: String,
            required: true
        },
        lastName: {
            type: String,
            required: true
        },
        emailID: {
            type: String,
            required: true
        }
    }
);

const Enquiry = mongoose.model("enquiry", EnquirySchema);
module.exports = Enquiry;