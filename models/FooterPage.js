const { default: mongoose } = require("mongoose");
const { Schema } = mongoose;

const FooterPageSchema = new Schema(
  {
    heading: {
      type: String,
      required: true,
      trim: true,
    },
    subHeading: {
      type: String,
    },
    media: {
      type: String,
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    content: {
      type: String,
      default: "",
    },
    language: {
      type: String,
      default: "en",
      trim: true,
    },
    public_id: {
      type: String,
    }
  },
  { timestamps: true }
);

const FooterPage = mongoose.model("footerpage", FooterPageSchema);
module.exports = FooterPage;
