const { default: mongoose, Schema } = require("mongoose");

const PartnerSchema = new Schema(
    {
        name: {
            type: String,
            required: true
        },
        logo: {
            type: String,
            required: true
        },
        url: {
            type: String
        },
        public_id: {
            type: String
        }
    },
    {timestamps: true}
);

const Partner = mongoose.model("partner", PartnerSchema);
module.exports = Partner;