const { default: mongoose, Schema } = require("mongoose");

const footerSectionSchema = new Schema({
  title: {
    type: String,
  },
  key: {
    type: String,
  },
  url: {
    type: String,
  },
  externalURL: {
    type: String,
  },
  isCta: {
    type: Boolean,
    default: false,
  },
  logo: {
    type: String,
  },
  companyName: {
    type: String,
  },
  footerId: {
    type: Schema.Types.ObjectId,
    ref: "footer",
  },
  order: {
    type: Number,
    default: 1,
  },
});

const FooterSection = mongoose.model("footerSection", footerSectionSchema);
module.exports = FooterSection;
