const { default: mongoose, Schema } = require("mongoose");

const EnquirySchema = new Schema({
  fullName: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  emailId: {
    type: String,
    required: true,
  },
});

const Enquiry = mongoose.model("enquiry", EnquirySchema);
module.exports = Enquiry;
