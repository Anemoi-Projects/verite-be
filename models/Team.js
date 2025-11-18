const { Schema } = require("mongoose");
const { default: mongoose } = require("mongoose");

const TeamSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    designation: {
      type: String,
      required: true,
    },
    picture: {
      type: String,
    },
    public_id: {
      type: String,
    },
    type: {
      type: String,
      enum: ["advisoryTeam", "internalTeam"],
      required: true,
    },
    linkedIn: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

const Team = mongoose.model("team", TeamSchema);
module.exports = Team;
