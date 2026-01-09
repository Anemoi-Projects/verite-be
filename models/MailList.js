const { default: mongoose } = require("mongoose");

const { Schema } = mongoose;
const MailListSchema = new Schema(
  {
    emailID:{
      type:String,
      required : true,
      lowercase : true,
      trim : true,
      default: null
    },
  },
  { timestamps: true }
);

const MailList = mongoose.model('maillist', MailListSchema);
module.exports = MailList;