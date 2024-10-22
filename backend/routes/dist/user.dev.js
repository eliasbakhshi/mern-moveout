"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = require("express");

var _expressAsyncHandler = _interopRequireDefault(require("express-async-handler"));

var _user = require("../controllers/user.js");

var _expressValidator = require("express-validator");

var _User = _interopRequireDefault(require("../models/User.js"));

var _validateToken = _interopRequireDefault(require("../middlewares/validateToken.js"));

var _checkAccess = _interopRequireDefault(require("../middlewares/checkAccess.js"));

var _multer = _interopRequireDefault(require("../middlewares/multer.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var router = (0, _express.Router)();
router.post("/register", (0, _expressValidator.body)("email").trim().isEmail().withMessage("The email is not correct.").custom(function (value) {
  return _User["default"].findOne({
    email: value
  }).then(function (user) {
    if (user) {
      return Promise.reject("The email is already in use.");
    }
  });
}), (0, _expressValidator.body)("password", "The password must be alphanumeric and at least 6 characters long.").isLength({
  min: 6,
  max: 100
}).isAlphanumeric(), (0, _expressValidator.body)("confirmPassword").custom(function (value, _ref) {
  var req = _ref.req;

  if (value !== req.body.password) {
    throw new Error("The passwords do not match.");
  }

  return true;
}), (0, _expressAsyncHandler["default"])(_user.register));
router.post("/register-with-google", (0, _expressValidator.body)("email").isEmail().withMessage("The email is not correct.").custom(function (value) {
  return _User["default"].findOne({
    email: value
  }).then(function (user) {
    if (user) {
      return Promise.reject("The email is already in use.");
    }
  });
}), (0, _expressAsyncHandler["default"])(_user.registerWithGoogle));
router.post("/login", (0, _expressValidator.body)("email").trim().isEmail().withMessage("The email is not valid."), (0, _expressValidator.body)("password", "The password must be alphanumeric and at least 6 characters long.").isLength({
  min: 6,
  max: 100
}).isAlphanumeric(), (0, _expressAsyncHandler["default"])(_user.login));
router.post("/login-with-google", (0, _expressValidator.body)("email").trim().isEmail().withMessage("The email is not valid."), (0, _expressAsyncHandler["default"])(_user.loginWithGoogle));
router.post("/logout", (0, _expressAsyncHandler["default"])(_user.logout));
router.put("/verify-email", (0, _expressAsyncHandler["default"])(_user.verifyEmail));
router.post("/verify-email", (0, _expressValidator.body)("email").trim().isEmail().withMessage("The email is not valid."), (0, _expressAsyncHandler["default"])(_user.sendVerificationEmail));
router.post("/reset-password", (0, _expressValidator.body)("email").trim().isEmail().withMessage("The email is not valid."), (0, _expressAsyncHandler["default"])(_user.sendResetPasswordEmail));
router.get("/reset-password/:token", (0, _expressAsyncHandler["default"])(_user.verifyTokenResetPassword));
router.put("/reset-password", (0, _expressValidator.body)("password", "The password must be alphanumeric and at least 6 characters long.").isLength({
  min: 6,
  max: 100
}).isAlphanumeric(), (0, _expressValidator.body)("confirmPassword").custom(function (value, _ref2) {
  var req = _ref2.req;

  if (value && value !== req.body.password) {
    throw new Error("The passwords do not match.");
  }

  return true;
}), (0, _expressAsyncHandler["default"])(_user.updateUserPasswordById));
router.get("/users", _validateToken["default"], (0, _checkAccess["default"])("admin"), (0, _expressAsyncHandler["default"])(_user.getUsers));
router.get("/users/deleted", _validateToken["default"], (0, _checkAccess["default"])("admin"), (0, _expressAsyncHandler["default"])(_user.getDeletedUsers));
router.put("/users/current", _validateToken["default"], (0, _checkAccess["default"])("user"), _multer["default"], (0, _expressValidator.body)("email").trim().isEmail().withMessage("The email is not correct."), (0, _expressValidator.body)("password", "The password must be alphanumeric and at least 6 characters long.").optional({
  checkFalsy: true
}).isLength({
  min: 6,
  max: 100
}).isAlphanumeric(), (0, _expressValidator.body)("confirmPassword").optional({
  checkFalsy: true
}).custom(function (value, _ref3) {
  var req = _ref3.req;

  if (value && value !== req.body.password) {
    throw new Error("The passwords do not match.");
  }

  return true;
}), (0, _expressAsyncHandler["default"])(_user.updateCurrentUser));
router.get("/users/current", _validateToken["default"], (0, _checkAccess["default"])("user"), (0, _expressAsyncHandler["default"])(_user.getCurrentUser));
router.get("/users/get-name-email", _validateToken["default"], (0, _checkAccess["default"])("user"), (0, _expressAsyncHandler["default"])(_user.getNamesAndEmails));
router.post("/users/share-box", _validateToken["default"], (0, _checkAccess["default"])("user"), (0, _expressValidator.body)("email").trim().isEmail().withMessage("The email is not valid."), (0, _expressAsyncHandler["default"])(_user.shareBox));
router.post("/users/share-label", _validateToken["default"], (0, _checkAccess["default"])("user"), (0, _expressValidator.body)("email").trim().isEmail().withMessage("The email is not valid."), (0, _expressAsyncHandler["default"])(_user.shareLabel));
router.put("/users/deactivate-current", _validateToken["default"], (0, _checkAccess["default"])("user"), (0, _expressAsyncHandler["default"])(_user.deactivateCurrentUser));
router.put("/users/reactivate-current", _validateToken["default"], (0, _checkAccess["default"])("user"), (0, _expressAsyncHandler["default"])(_user.reactivateCurrentUser));
router.put("/users/send-delete-email", _validateToken["default"], (0, _checkAccess["default"])("user"), (0, _expressAsyncHandler["default"])(_user.sendDeleteEmail));
router["delete"]("/users/current", _validateToken["default"], (0, _checkAccess["default"])("user"), (0, _expressAsyncHandler["default"])(_user.deleteCurrentUser));
router.post("/users", _validateToken["default"], (0, _checkAccess["default"])("admin"), (0, _expressValidator.body)("name").trim().isString().withMessage("The name is not valid."), (0, _expressValidator.body)("email").trim().isEmail().withMessage("The email is not valid."), (0, _expressAsyncHandler["default"])(_user.createUser));
router.put("/users", _validateToken["default"], (0, _checkAccess["default"])("admin"), (0, _expressValidator.body)("name").trim().isString().withMessage("The name is not valid."), (0, _expressValidator.body)("email").trim().isEmail().withMessage("The email is not valid."), (0, _expressAsyncHandler["default"])(_user.editUser));
router["delete"]("/users", _validateToken["default"], (0, _checkAccess["default"])("admin"), (0, _expressAsyncHandler["default"])(_user.deleteUser));
router.put("/users/status", _validateToken["default"], (0, _checkAccess["default"])("admin"), (0, _expressAsyncHandler["default"])(_user.changeUserStatus));
var _default = router; // TODO: redirect to verification page after the token was expired or changed or invalid
// TODO: Implement reset password

exports["default"] = _default;