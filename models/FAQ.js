const { default: mongoose } = require("mongoose");
const { Schema } = require("mongoose");

const FAQSchema = new Schema(
  {
    question: {
      type: String,
      required: true,
    },
    answer: {
      type: String,
      required: true,
    },
    tag: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "categories",
      },
    ],
  },
  { timestamps: true }
);

const FAQ = mongoose.model("faq", FAQSchema);
module.exports = FAQ;
