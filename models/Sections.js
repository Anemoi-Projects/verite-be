const { default: mongoose } = require("mongoose");

const { Schema } = mongoose;

const SectionSchema = new Schema(
  {
    headline: {
      type: String,

      //   default: {}
    },
    subHeadline: {
      type: String,

      //   default: {}
    },
    description: {
      type: String,

      //   default: {}
    },
    ctaButton: {
      type: String,
    },
    ctaLink: {
      type: String,
    },
    sectionBackground: {
      light: { type: String, default: "" },
      dark: { type: String, default: "" },
    },
    sectionMedia: {
      type: String,
      default: "",
    },
    mediaType: {
      type: String,
    },
    pageId: {
      type: Schema.Types.ObjectId,
      ref: "pages_alt",
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    order: {
      type: Number,
    },
  },
  { timestamps: true }
);

// SectionSchema.virtual('subsections', {
//   ref: 'subsections', // model name of SubSections
//   localField: '_id',
//   foreignField: 'sectionId',
//   justOne: false
// });

// // Enable virtuals in toObject / toJSON
// SectionSchema.set('toObject', { virtuals: true });
// SectionSchema.set('toJSON', { virtuals: true });

const Sections = mongoose.model("sections", SectionSchema);
module.exports = Sections;
