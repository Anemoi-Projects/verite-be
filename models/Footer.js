const { default: mongoose, Schema } = require("mongoose");

const footerSchema = new Schema({
  title: {
    type: String,
    required: true,
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
  disclaimer: {
    type: String,
  },
  isCta: {
    type: Boolean,
    default: false,
  },
  key: {
    type: String,
    required: true,
  },
  content: {
    type: String,
  },
  sections: [
    {
      type: Schema.Types.ObjectId,
      ref: "footersection",
    },
  ],
});

const Footer = mongoose.model("Footer", footerSchema);
module.exports = Footer;
