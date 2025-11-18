const { Schema, default: mongoose } = require("mongoose");

const categorySchema = new Schema({
  name: { type: String, required: true, unique: false },
  slug: { type: String, default: null, unique: false },
});

const Categories = mongoose.model("categories", categorySchema);
module.exports = Categories;
