const { default: mongoose } = require("mongoose");

const { Schema } = mongoose;
const AdminSchema = new Schema(
  {
    fullName:{
      type:String,
      required : false,
      trim : true,
      default: null
    },
    emailId: {
      type: String,
      required: true,
      unique: true,
      lowerCase: true,
      trim: true,
    },
    password: {
      type: String,
      required: false,
      trim: true,
      length: 6,
      select: false,
    },
    resetPasswordToken: {
      type: String,
      select: false,
      default: null
    },
    resetPasswordExpiresAt: {
      type: Date
    },
    role:{
      type: String,
      default: "admin",
      enum: ["admin", "superadmin"]
    }
  },
  { timestamps: true }
);

const Admin = mongoose.model('admin', AdminSchema);
module.exports = Admin;