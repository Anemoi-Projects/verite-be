const { Schema, default: mongoose } = require("mongoose");

const headerSchema = new Schema({
  title: {
    type: String,
  },
  url: {
    type: String,
  },
  externalURL: {
    type: Boolean,
    default: false,
  },
  isCta: {
    type: Boolean,
    default: false,
  },
  disclaimer: {
    type: String,
    default: null,
  },
  order: {
    type: Number,
  },
  published: {
    type: Boolean,
    default: true,
  },
});

const Header = mongoose.model("header", headerSchema);
module.exports = Header;
