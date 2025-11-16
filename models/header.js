const { Schema, default: mongoose } = require("mongoose");

const headerSchema = new Schema(
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
        order: {
            type: Number,
        },
        published: {
            type: Boolean,
            default: true
        }
}
);

const Header = mongoose.model('header', headerSchema);
module.exports = Header;