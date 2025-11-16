const { default: mongoose } = require("mongoose");
const { Schema } = require("mongoose");

const ResourcesSchema = new Schema(
    {
        title: {
            type: String,
            required: true
        },
        buttonName: {
            type: String,
            required: true
        },
        // tag: {
        //     type: Array,
        //     default: []
        // },
        lang: {
            type: String,
            default: "en"
        },
        url: {
            type: String
        },
        cloudinary_publicID: {
            type: String,
            default: null
        },
        tag: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'categories'
        }]
    },
    { timestamps: true }
);

const Resources = mongoose.model('resources', ResourcesSchema);
module.exports = Resources;