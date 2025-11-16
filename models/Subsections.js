const { default: mongoose } = require("mongoose");

const { Schema } = mongoose;

const SubSectionsSchema = new Schema(
  {
    heading: {
      type: String,
      //   default: {}
    },
    subHeading: {
      type: String,
      //   default: {}
    },
    ctaButton: {
      type: String,
      //   default: {}
    },
    ctaLink: {
      type: String,
    },
    description: {
      type: String,
      //   default: {}
    },
    subSectionMedia: {
      type: String,
      default: null,
    },
    mediaType: {
      type: String,
    },
    sectionId: {
      type: Schema.Types.ObjectId,
      ref: "sections",
    },
    order: {
      type: Number,
    },
  },
  { timestamps: true }
);

const SubSections = mongoose.model("subsections", SubSectionsSchema);
module.exports = SubSections;
