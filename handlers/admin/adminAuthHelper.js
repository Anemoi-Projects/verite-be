const { body, query, validationResult } = require("express-validator");
const { sendErrorResponse } = require("../errorHandler/errorHandler");

const validateAdminLogin = [
  body("email").isEmail().withMessage("Invalid Email Id"),
  body("password").isLength({ min: 6 }).withMessage("Invalid Password"),
];

const extractValidationErrors = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errors.array().map((error) => ({
      field: error.param,
      message: error.msg,
    }));
  }
  return null;
};

const handleValidationErrors = (req, res, next) => {
  const errors = extractValidationErrors(req);
  if (errors) {
    return sendErrorResponse(res, 400, errors);
  }
  next();
};

module.exports = {
  validateAdminLogin,
  extractValidationErrors,
  handleValidationErrors,
};
