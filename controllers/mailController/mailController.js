const {
  sendErrorResponse,
} = require("../../handlers/errorHandler/errorHandler");
const MailList = require("../../models/MailList");

const addToMailList = async (req, res) => {
  try {
    const { emailID } = req.body;
    if (!emailID) return sendErrorResponse(res, 400, "Email ID is required");
    let check = await MailList.findOne({ emailID });
    if (check) {
      return res.status(200).json({
        success: true,
        data: "Already subscribed",
        isSubscribed: true,
      });
    } else {
      await MailList.create({ emailID });
      return res.status(200).json({
        success: true,
        data: "Successfully added to mail list",
        isSubscribed: true,
      });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, data: "Internal Server Error" });
  }
};

const getMailList = async (req, res) => {
  try {
    let maillist = await MailList.find({});
    return res.status(200).json({ success: true, data: maillist });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, data: "Internal Server Error" });
  }
};

const deleteMailList = async (req, res) => {
  try {
    let { mailID } = req.body;
    let maillist = await MailList.findById(mailID);
    if(!maillist){
      return res.status(404).json({ success: false, data: "Mail ID not found" });
    }
    await MailList.findByIdAndDelete(mailID);
    return res.status(200).json({ success: true, data: "Successfully deleted" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, data: "Internal Server Error" });
  }
};

module.exports = { addToMailList, getMailList,deleteMailList };
