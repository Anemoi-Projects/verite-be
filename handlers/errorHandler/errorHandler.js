const sendErrorResponse = (res, statusCode, message) => {
  return res.status(statusCode).json({ success: false, data: message });
};

module.exports = {
  sendErrorResponse,
};
