const { Schema, default: mongoose } = require("mongoose");

const categorySchema = new Schema(
    {
        name: { type: String, required: true, unique:false },
        slug: { type: String, default: null, unique: false },
        lang: { type: String, default: "en", required: true }
    }
)

const Categories = mongoose.model('categories', categorySchema)
module.exports = Categories;