const { default: mongoose } = require("mongoose");
const { Schema } = mongoose;

const BlogSchema = new Schema(
  {
    heading: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    content: {
      type: String,
      default: "",
    },
    thumbnail: {
      type: String,
      default: null,
    },
    tags: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'categories'
        }],
    authorName: {
      type: String,
      required: true,
      trim: true,
    },
    authorBio: {
      type: String,
      default: "",
    },
    authorImage: {
      type: String,
      default: null,
    },
    seoTitle: {
      type: String,
      default: "",
      trim: true,
    },
    seoDescription: {
      type: String,
      default: "",
      trim: true,
    },
    seoKeywords: {
      type: [String],
      default: [],
    },
    ogTitle: {
      type: String,
      default: "",
      trim: true,
    },
    ogDescription: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
    language: {
      type: String,
      default: "en",
      trim: true,
    },
  },
  { timestamps: true }
);

const Blogs = mongoose.model("blogs", BlogSchema);
module.exports = Blogs;
