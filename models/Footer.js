const { default: mongoose, Schema } = require("mongoose");

const footerSchema = new Schema(
     {
        title: {
            type: "String",
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
        lang: {
            type: String,
            default: "en",
            required: true
        },
        isCta: {
            type: Boolean,
            default: false
        },
        key: {
            type: String,
            required: true
        },
        content: {
            type: String,
        },
        sections: [
    {
        title: {
            type: String,
        },
        url: {
            type: String,
        },
        externalURL: {
            type: Boolean,
            default: false
        },
        isCta: {
            type: Boolean,
            default: false
        },
        key: {
            type: String,
            required: true
        },
        published: {
            type: Boolean,
            default: true
        }
    }
],
}
);

const Footer = mongoose.model("footer", footerSchema);
module.exports = Footer