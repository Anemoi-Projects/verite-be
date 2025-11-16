const { default: mongoose } = require("mongoose");

const { Schema } = mongoose;
const PagesSchema = new Schema(
  {
    name: {
      type: String,
    },
    path: {
      type: String,
      required: true,
      unique: true,
    },
    meta: {
      title: {
        type: String,
      },
      description: {
        type: String,
      },
    },
    seoTitle: {
      type: String,
      default: "",
    },
    seoDescription: {
      type: String,
      default: "",
    },
    seoKeywords: {
      type: Array,
      default: [],
    },
    tags: {
      type: Array,
      default: [],
    },
    ogTitle: {
      type: String,
      default: "",
    },
    ogDescription: {
      type: String,
      default: "",
    },
    published: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Pages = mongoose.model("pages", PagesSchema);
module.exports = Pages;
