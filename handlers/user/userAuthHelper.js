const { body, query, validationResult } = require("express-validator");
const { sendErrorResponse } = require("../../handlers/errorHandler/errorHandler");

const userRegisterValidator = [
  body("email").isEmail().withMessage("Invalid Email Id"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
]
const updateUserValidator = [
  body("email").isEmail().optional({nullable: true}).withMessage("Invalid Email Id"),
  body("password").isLength({ min: 6 }).optional({nullable: true}).withMessage("Password must be at least 6 characters long"),
]

const forgetPasswordValidator = [
  body("emailId").isEmail().withMessage("Invalid Email Id"),
  body("role").isIn(["admin", "user"]).withMessage("Invalid Role")
]

const verifyOtpForgotPwdValidator = [
  body("otp").isLength({ min: 6, max: 6 }).withMessage("Invalid OTP"),
  body("emailId").isEmail().withMessage("Invalid Email Id")
]

const resetPasswordValidator = [
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
]

const passwordChangeValidator = [
  body("oldPassword").isLength({ min: 6 }).withMessage("Old password must be at least 6 characters long"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
]


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
  extractValidationErrors,
  forgetPasswordValidator,
  handleValidationErrors,
  userRegisterValidator,
  resetPasswordValidator,
  passwordChangeValidator,
  verifyOtpForgotPwdValidator,
  updateUserValidator
};