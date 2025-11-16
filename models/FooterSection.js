const { default: mongoose, Schema } = require("mongoose");

const footerSectionSchema = new Schema(
     {
        title: {
            type: Map,
            of: String
        },
        url: {
            type: String
        },
        externalURL: {
            type: String
        },
        isCta: {
            type: Boolean,
            default: false
        },
        disclaimer: {
            type: Map,
            of: String
        },
        socialLinks: {
            type: Map,
            of: String
        },
        logo: {
            type: String
        },
        companyName: {
            type: String
        },
        copyrightText: {
            type: Map,
            of: String
        },
        footerID: {
            type: Schema.Types.ObjectId,
            ref: 'footer'
        }
}
);

const FooterSection = mongoose.model("footersection", footerSectionSchema);
module.exports = FooterSection