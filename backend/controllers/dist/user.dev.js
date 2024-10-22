"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.sendDeleteEmail = exports.reactivateCurrentUser = exports.deactivateCurrentUser = exports.shareLabel = exports.shareBox = exports.getNamesAndEmails = exports.deleteCurrentUser = exports.changeUserStatus = exports.recoverUser = exports.deleteUser = exports.editUser = exports.createUser = exports.updateCurrentUser = exports.getCurrentUser = exports.getDeletedUsers = exports.getUsers = exports.updateUserPasswordById = exports.verifyTokenResetPassword = exports.sendResetPasswordEmail = exports.sendVerificationEmail = exports.verifyEmail = exports.logout = exports.loginWithGoogle = exports.login = exports.registerWithGoogle = exports.register = void 0;

var _User = _interopRequireDefault(require("../models/User.js"));

var _Box = _interopRequireDefault(require("../models/Box.js"));

var _DeletedUser = _interopRequireDefault(require("../models/DeletedUser.js"));

var _DeletedBox = _interopRequireDefault(require("../models/DeletedBox.js"));

var _bcryptjs = _interopRequireDefault(require("bcryptjs"));

var _expressValidator = require("express-validator");

var _createSetToken = _interopRequireDefault(require("../middlewares/createSetToken.js"));

var _nodemailer = _interopRequireDefault(require("../config/nodemailer.js"));

var _crypto = _interopRequireDefault(require("crypto"));

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _shortUniqueId = _interopRequireDefault(require("short-unique-id"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var _dirname = _path["default"].resolve();

var register = function register(req, res) {
  var _req$body, name, email, password, userExists, hashed, emailToken, emailVerificationToken, emailVerificationTokenExpiresAt, user, emailTemplate;

  return regeneratorRuntime.async(function register$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _req$body = req.body, name = _req$body.name, email = _req$body.email, password = _req$body.password;
          email = email.trim().toLowerCase();

          if (!(!name || !email || !password)) {
            _context.next = 4;
            break;
          }

          return _context.abrupt("return", res.status(400).json({
            message: "Please fill in all the fields."
          }));

        case 4:
          _context.next = 6;
          return regeneratorRuntime.awrap(_User["default"].findOne({
            email: email
          }));

        case 6:
          userExists = _context.sent;

          if (!userExists) {
            _context.next = 9;
            break;
          }

          return _context.abrupt("return", res.status(400).json({
            message: "Email already exists."
          }));

        case 9:
          _context.next = 11;
          return regeneratorRuntime.awrap(_bcryptjs["default"].hash(password, 10));

        case 11:
          hashed = _context.sent;
          emailToken = _crypto["default"].randomBytes(32).toString("hex");
          emailVerificationToken = _crypto["default"].createHash("sha256").update(emailToken).digest("hex");
          emailVerificationTokenExpiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days
          // Create a new user

          _context.next = 17;
          return regeneratorRuntime.awrap(_User["default"].create({
            name: name,
            email: email,
            password: hashed,
            emailVerificationToken: emailVerificationToken,
            emailVerificationTokenExpiresAt: emailVerificationTokenExpiresAt,
            registeredWith: ["Email"]
          }));

        case 17:
          user = _context.sent;
          // Get the email template
          emailTemplate = _fs["default"].readFileSync(_path["default"].resolve(".") + "/backend/views/template-email-verification.html", "utf8");
          emailTemplate = emailTemplate.replace(/(\*\*name\*\*)/g, name);
          emailTemplate = emailTemplate.replace(/(\*\*button_text\*\*)/g, "Verify Me");
          emailTemplate = emailTemplate.replace(/(\*\*email_link\*\*)/g, "".concat(process.env.BASE_URL, "/verify-email/").concat(emailVerificationToken));
          _context.prev = 22;
          _context.next = 25;
          return regeneratorRuntime.awrap(_nodemailer["default"].sendMail({
            from: "\"".concat(process.env.SITE_NAME, "\" <").concat(process.env.SMTP_USER, ">"),
            to: email,
            subject: "Please verify your email.",
            text: "Thank you ".concat(name, " for signing up! We're excited to have you on board."),
            html: emailTemplate
          }));

        case 25:
          _context.next = 32;
          break;

        case 27:
          _context.prev = 27;
          _context.t0 = _context["catch"](22);
          _context.next = 31;
          return regeneratorRuntime.awrap(user.deleteOne());

        case 31:
          return _context.abrupt("return", res.status(500).json({
            message: "Email address rejected because domain not found."
          }));

        case 32:
          return _context.abrupt("return", res.status(201).json({
            message: "User created successfully."
          }));

        case 33:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[22, 27]]);
};

exports.register = register;

var registerWithGoogle = function registerWithGoogle(req, res) {
  var _req$body2, name, email, mediaPath, userExists, user, emailTemplate;

  return regeneratorRuntime.async(function registerWithGoogle$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _req$body2 = req.body, name = _req$body2.name, email = _req$body2.email, mediaPath = _req$body2.picture;
          email = email.trim().toLowerCase();

          if (!(!name || !email || !mediaPath)) {
            _context2.next = 4;
            break;
          }

          return _context2.abrupt("return", res.status(400).json({
            message: "Please fill in all the fields."
          }));

        case 4:
          _context2.next = 6;
          return regeneratorRuntime.awrap(_User["default"].findOne({
            email: email
          }));

        case 6:
          userExists = _context2.sent;

          if (!userExists) {
            _context2.next = 9;
            break;
          }

          return _context2.abrupt("return", res.status(400).json({
            message: "Email already exists."
          }));

        case 9:
          _context2.next = 11;
          return regeneratorRuntime.awrap(_User["default"].create({
            name: name,
            email: email,
            mediaPath: mediaPath,
            verified: true,
            registeredWith: ["Google"]
          }));

        case 11:
          user = _context2.sent;
          _context2.next = 14;
          return regeneratorRuntime.awrap(user.save());

        case 14:
          // Get the email template
          emailTemplate = _fs["default"].readFileSync(_path["default"].resolve(".") + "/backend/views/template-welcome-registration.html", "utf8");
          emailTemplate = emailTemplate.replace(/(\*\*website_url\*\*)/g, "".concat(process.env.BASE_URL));
          emailTemplate = emailTemplate.replace(/(\*\*name\*\*)/g, user.name);
          _context2.prev = 17;
          _context2.next = 20;
          return regeneratorRuntime.awrap(_nodemailer["default"].sendMail({
            from: "\"".concat(process.env.SITE_NAME, "\" <").concat(process.env.SMTP_USER, ">"),
            to: email,
            subject: "Welcome to ".concat(process.env.SITE_NAME),
            text: "Thank you ".concat(name, " for signing up! We're excited to have you on board."),
            html: emailTemplate
          }));

        case 20:
          _context2.next = 27;
          break;

        case 22:
          _context2.prev = 22;
          _context2.t0 = _context2["catch"](17);
          _context2.next = 26;
          return regeneratorRuntime.awrap(user.deleteOne());

        case 26:
          return _context2.abrupt("return", res.status(500).json({
            message: "Email address rejected because domain not found."
          }));

        case 27:
          // Create and set a token
          (0, _createSetToken["default"])(res, user._id);
          return _context2.abrupt("return", res.status(200).json({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            mediaPath: user.mediaPath,
            isActive: user.isActive
          }));

        case 29:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[17, 22]]);
};

exports.registerWithGoogle = registerWithGoogle;

var login = function login(req, res) {
  var _req$body3, email, password, remember, err, user, registeredWith, valid;

  return regeneratorRuntime.async(function login$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _req$body3 = req.body, email = _req$body3.email, password = _req$body3.password, remember = _req$body3.remember;
          email = email.trim().toLowerCase();

          if (!(!email || !password)) {
            _context3.next = 4;
            break;
          }

          return _context3.abrupt("return", res.status(400).json({
            message: "Please fill in all the fields."
          }));

        case 4:
          // Validate the email and password
          err = (0, _expressValidator.validationResult)(req);

          if (err.isEmpty()) {
            _context3.next = 7;
            break;
          }

          return _context3.abrupt("return", res.status(422).json({
            message: err.array()[0].msg
          }));

        case 7:
          _context3.next = 9;
          return regeneratorRuntime.awrap(_User["default"].findOne({
            email: email
          }));

        case 9:
          user = _context3.sent;

          if (user) {
            _context3.next = 12;
            break;
          }

          return _context3.abrupt("return", res.status(400).json({
            message: "User not found."
          }));

        case 12:
          if (user.registeredWith.includes("Email")) {
            _context3.next = 15;
            break;
          }

          registeredWith = user.registeredWith.join(", ");
          return _context3.abrupt("return", res.status(400).json({
            message: "You have registered with ".concat(registeredWith, ". Please login with ").concat(registeredWith, ".")
          }));

        case 15:
          if (user.emailVerified) {
            _context3.next = 17;
            break;
          }

          return _context3.abrupt("return", res.status(400).json({
            message: "Please verify your email."
          }));

        case 17:
          _context3.next = 19;
          return regeneratorRuntime.awrap(_bcryptjs["default"].compare(password, user.password));

        case 19:
          valid = _context3.sent;

          if (valid) {
            _context3.next = 22;
            break;
          }

          return _context3.abrupt("return", res.status(400).json({
            message: "Invalid email or password."
          }));

        case 22:
          // Create and set a token
          (0, _createSetToken["default"])(res, user._id, remember);
          return _context3.abrupt("return", res.status(200).json({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            mediaPath: user.mediaPath,
            isActive: user.isActive
          }));

        case 24:
        case "end":
          return _context3.stop();
      }
    }
  });
};

exports.login = login;

var loginWithGoogle = function loginWithGoogle(req, res) {
  var _req$body4, email, name, picture, err, user, registeredWith;

  return regeneratorRuntime.async(function loginWithGoogle$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _req$body4 = req.body, email = _req$body4.email, name = _req$body4.name, picture = _req$body4.picture;
          email = email.trim().toLowerCase();

          if (!(!email || !name)) {
            _context4.next = 4;
            break;
          }

          return _context4.abrupt("return", res.status(400).json({
            message: "Please provide a name and an email"
          }));

        case 4:
          // Validate the email and password
          err = (0, _expressValidator.validationResult)(req);

          if (err.isEmpty()) {
            _context4.next = 7;
            break;
          }

          return _context4.abrupt("return", res.status(422).json({
            message: err.array()[0].msg
          }));

        case 7:
          _context4.next = 9;
          return regeneratorRuntime.awrap(_User["default"].findOne({
            email: email
          }));

        case 9:
          user = _context4.sent;

          if (user) {
            _context4.next = 12;
            break;
          }

          return _context4.abrupt("return", res.status(400).json({
            message: "You need to register first to be able to login with Google."
          }));

        case 12:
          if (!(!user.registeredWith.includes("Email") && !user.registeredWith.includes("Google"))) {
            _context4.next = 15;
            break;
          }

          registeredWith = user.registeredWith.join(", ");
          return _context4.abrupt("return", res.status(400).json({
            message: "You have registered with ".concat(registeredWith, ". Please login with ").concat(registeredWith, ".")
          }));

        case 15:
          // Verify the user
          user.emailVerified = true;
          user.emailVerificationToken = undefined;
          user.emailVerificationTokenExpiresAt = undefined;
          user.name = user.name || name;
          user.mediaPath = user.mediaPath || picture;
          _context4.next = 22;
          return regeneratorRuntime.awrap(user.save());

        case 22:
          // Create and set a token
          (0, _createSetToken["default"])(res, user._id);
          return _context4.abrupt("return", res.status(200).json({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            mediaPath: user.mediaPath,
            isActive: user.isActive
          }));

        case 24:
        case "end":
          return _context4.stop();
      }
    }
  });
};

exports.loginWithGoogle = loginWithGoogle;

var logout = function logout(req, res) {
  // Clear the cookie
  res.clearCookie("JWTMERNMoveOut");
  return res.status(200).json({
    message: "Logged out."
  });
};

exports.logout = logout;

var verifyEmail = function verifyEmail(req, res) {
  var token, user;
  return regeneratorRuntime.async(function verifyEmail$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          token = req.body.token;

          if (token) {
            _context5.next = 3;
            break;
          }

          return _context5.abrupt("return", res.status(400).json({
            message: "Token is required."
          }));

        case 3:
          _context5.next = 5;
          return regeneratorRuntime.awrap(_User["default"].findOne({
            emailVerificationToken: token,
            emailVerificationTokenExpiresAt: {
              $gt: Date.now()
            }
          }));

        case 5:
          user = _context5.sent;

          if (user) {
            _context5.next = 8;
            break;
          }

          return _context5.abrupt("return", res.status(400).json({
            message: "Invalid token or token expired."
          }));

        case 8:
          // Update the user and set emailVerified to true
          user.emailVerificationToken = undefined;
          user.emailVerificationTokenExpiresAt = undefined;
          user.emailVerified = true;
          _context5.next = 13;
          return regeneratorRuntime.awrap(user.save());

        case 13:
          return _context5.abrupt("return", res.status(200).json({
            message: "Email verified."
          }));

        case 14:
        case "end":
          return _context5.stop();
      }
    }
  });
};

exports.verifyEmail = verifyEmail;

var sendVerificationEmail = function sendVerificationEmail(req, res) {
  var err, email, user, emailToken, emailVerificationToken, emailTemplate;
  return regeneratorRuntime.async(function sendVerificationEmail$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          // Validate the email
          err = (0, _expressValidator.validationResult)(req);

          if (err.isEmpty()) {
            _context6.next = 3;
            break;
          }

          return _context6.abrupt("return", res.status(422).json({
            message: err.array()[0].msg
          }));

        case 3:
          email = req.body.email;
          email = email.trim().toLowerCase();

          if (email) {
            _context6.next = 7;
            break;
          }

          return _context6.abrupt("return", res.status(400).json({
            message: "Email is required."
          }));

        case 7:
          _context6.next = 9;
          return regeneratorRuntime.awrap(_User["default"].findOne({
            email: email
          }));

        case 9:
          user = _context6.sent;

          if (user) {
            _context6.next = 12;
            break;
          }

          return _context6.abrupt("return", res.status(400).json({
            message: "Email not found."
          }));

        case 12:
          if (!user.emailVerified) {
            _context6.next = 14;
            break;
          }

          return _context6.abrupt("return", res.status(400).json({
            message: "Email already verified."
          }));

        case 14:
          // Create a new email token
          emailToken = _crypto["default"].randomBytes(32).toString("hex");
          emailVerificationToken = _crypto["default"].createHash("sha256").update(emailToken).digest("hex"); // Update the user

          user.emailVerificationToken = emailVerificationToken;
          user.emailVerificationTokenExpiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days

          _context6.next = 20;
          return regeneratorRuntime.awrap(user.save());

        case 20:
          // Get the email template
          emailTemplate = _fs["default"].readFileSync(_path["default"].resolve(".") + "/backend/views/template-email-verification.html", "utf8");
          emailTemplate = emailTemplate.replace(/(\*\*email_link\*\*)/g, "".concat(process.env.BASE_URL, "/verify-email/").concat(emailVerificationToken));
          emailTemplate = emailTemplate.replace(/(\*\*name\*\*)/g, user.name); // Send the email

          _context6.next = 25;
          return regeneratorRuntime.awrap(_nodemailer["default"].sendMail({
            from: "\"".concat(process.env.SITE_NAME, "\" <").concat(process.env.SMTP_USER, ">"),
            to: email,
            subject: "Please verify your email.",
            text: "Thank you ".concat(user.name, " for signing up! We're excited to have you on board."),
            html: emailTemplate
          }));

        case 25:
          return _context6.abrupt("return", res.status(200).json({
            message: "Verification sent successfully. Please check your email."
          }));

        case 26:
        case "end":
          return _context6.stop();
      }
    }
  });
};

exports.sendVerificationEmail = sendVerificationEmail;

var sendResetPasswordEmail = function sendResetPasswordEmail(req, res) {
  var err, email, user, emailToken, resetPasswordToken, emailTemplate;
  return regeneratorRuntime.async(function sendResetPasswordEmail$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          // Validate the email
          err = (0, _expressValidator.validationResult)(req);

          if (err.isEmpty()) {
            _context7.next = 3;
            break;
          }

          return _context7.abrupt("return", res.status(422).json({
            message: err.array()[0].msg
          }));

        case 3:
          email = req.body.email;
          email = email.trim().toLowerCase();

          if (email) {
            _context7.next = 7;
            break;
          }

          return _context7.abrupt("return", res.status(400).json({
            message: "Email is required."
          }));

        case 7:
          _context7.next = 9;
          return regeneratorRuntime.awrap(_User["default"].findOne({
            email: email
          }));

        case 9:
          user = _context7.sent;

          if (user) {
            _context7.next = 12;
            break;
          }

          return _context7.abrupt("return", res.status(400).json({
            message: "Email not found."
          }));

        case 12:
          // Create a new email token
          emailToken = _crypto["default"].randomBytes(32).toString("hex");
          resetPasswordToken = _crypto["default"].createHash("sha256").update(emailToken).digest("hex"); // Update the user

          user.resetPasswordToken = resetPasswordToken;
          user.resetPasswordTokenExpiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days;

          _context7.next = 18;
          return regeneratorRuntime.awrap(user.save());

        case 18:
          // Get the email template
          emailTemplate = _fs["default"].readFileSync(_path["default"].resolve(".") + "/backend/views/template-email-reset-password.html", "utf8");
          emailTemplate = emailTemplate.replace(/(\*\*email_link\*\*)/g, "".concat(process.env.BASE_URL, "/reset-password/").concat(resetPasswordToken));
          emailTemplate = emailTemplate.replace(/(\*\*name\*\*)/g, user.name); // Send the email

          _context7.next = 23;
          return regeneratorRuntime.awrap(_nodemailer["default"].sendMail({
            from: "\"".concat(process.env.SITE_NAME, "\" <").concat(process.env.SMTP_USER, ">"),
            to: email,
            subject: "Resetting your password.",
            text: "Hi ".concat(user.name, "! You can click on the link below to reset your password."),
            html: emailTemplate
          }));

        case 23:
          return _context7.abrupt("return", res.status(200).json({
            message: "Instruction email sent successfully. Please check your email."
          }));

        case 24:
        case "end":
          return _context7.stop();
      }
    }
  });
};

exports.sendResetPasswordEmail = sendResetPasswordEmail;

var verifyTokenResetPassword = function verifyTokenResetPassword(req, res) {
  var token, user;
  return regeneratorRuntime.async(function verifyTokenResetPassword$(_context8) {
    while (1) {
      switch (_context8.prev = _context8.next) {
        case 0:
          token = req.params.token;

          if (token) {
            _context8.next = 3;
            break;
          }

          return _context8.abrupt("return", res.status(400).json({
            message: "Token is required."
          }));

        case 3:
          _context8.next = 5;
          return regeneratorRuntime.awrap(_User["default"].findOne({
            resetPasswordToken: token,
            resetPasswordTokenExpiresAt: {
              $gt: Date.now()
            }
          }));

        case 5:
          user = _context8.sent;

          if (user) {
            _context8.next = 8;
            break;
          }

          return _context8.abrupt("return", res.status(400).json({
            message: "Invalid token or token expired."
          }));

        case 8:
          return _context8.abrupt("return", res.status(200).json({
            message: "Token verified.",
            userId: user._id
          }));

        case 9:
        case "end":
          return _context8.stop();
      }
    }
  });
};

exports.verifyTokenResetPassword = verifyTokenResetPassword;

var updateUserPasswordById = function updateUserPasswordById(req, res) {
  var _req$body5, password, userId, err, user;

  return regeneratorRuntime.async(function updateUserPasswordById$(_context9) {
    while (1) {
      switch (_context9.prev = _context9.next) {
        case 0:
          _req$body5 = req.body, password = _req$body5.password, userId = _req$body5.userId; // Return the errors if there are any

          err = (0, _expressValidator.validationResult)(req);

          if (err.isEmpty()) {
            _context9.next = 4;
            break;
          }

          return _context9.abrupt("return", res.status(422).json({
            message: err.array()[0].msg
          }));

        case 4:
          _context9.next = 6;
          return regeneratorRuntime.awrap(_User["default"].findOne({
            _id: userId
          }));

        case 6:
          user = _context9.sent;

          if (user) {
            _context9.next = 9;
            break;
          }

          return _context9.abrupt("return", res.status(400).json({
            message: "User not found."
          }));

        case 9:
          _context9.next = 11;
          return regeneratorRuntime.awrap(_bcryptjs["default"].hash(password, 10));

        case 11:
          user.password = _context9.sent;
          user.resetPasswordToken = undefined;
          user.resetPasswordTokenExpiresAt = undefined;
          _context9.next = 16;
          return regeneratorRuntime.awrap(user.save());

        case 16:
          return _context9.abrupt("return", res.status(200).json({
            message: "Password has been updated."
          }));

        case 17:
        case "end":
          return _context9.stop();
      }
    }
  });
};

exports.updateUserPasswordById = updateUserPasswordById;

var getUsers = function getUsers(req, res) {
  var isAdmin, users, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, user, boxes, dataUsage, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, box, _iteratorNormalCompletion3, _didIteratorError3, _iteratorError3, _iterator3, _step3, item, stats;

  return regeneratorRuntime.async(function getUsers$(_context10) {
    while (1) {
      switch (_context10.prev = _context10.next) {
        case 0:
          _context10.next = 2;
          return regeneratorRuntime.awrap(_User["default"].findById({
            _id: req.user._id,
            role: "admin"
          }));

        case 2:
          isAdmin = _context10.sent;

          if (isAdmin) {
            _context10.next = 5;
            break;
          }

          return _context10.abrupt("return", res.status(404).json({
            message: "User not found."
          }));

        case 5:
          _context10.next = 7;
          return regeneratorRuntime.awrap(_User["default"].find({
            _id: {
              $ne: req.user._id
            }
          }, {
            password: 0
          }));

        case 7:
          users = _context10.sent;

          if (users) {
            _context10.next = 10;
            break;
          }

          return _context10.abrupt("return", res.status(404).json({
            message: "No users found."
          }));

        case 10:
          // get the data usage of each user
          _iteratorNormalCompletion = true;
          _didIteratorError = false;
          _iteratorError = undefined;
          _context10.prev = 13;
          _iterator = users[Symbol.iterator]();

        case 15:
          if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
            _context10.next = 70;
            break;
          }

          user = _step.value;
          _context10.next = 19;
          return regeneratorRuntime.awrap(_Box["default"].find({
            user: user._id
          }));

        case 19:
          boxes = _context10.sent;
          dataUsage = 0;
          _iteratorNormalCompletion2 = true;
          _didIteratorError2 = false;
          _iteratorError2 = undefined;
          _context10.prev = 24;
          _iterator2 = boxes[Symbol.iterator]();

        case 26:
          if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
            _context10.next = 50;
            break;
          }

          box = _step2.value;
          _iteratorNormalCompletion3 = true;
          _didIteratorError3 = false;
          _iteratorError3 = undefined;
          _context10.prev = 31;

          for (_iterator3 = box.items[Symbol.iterator](); !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            item = _step3.value;

            if (item.mediaPath && item.deletedAt === undefined) {
              stats = _fs["default"].statSync(_path["default"].join(_dirname, item.mediaPath));
              dataUsage += stats.size;
            }
          }

          _context10.next = 39;
          break;

        case 35:
          _context10.prev = 35;
          _context10.t0 = _context10["catch"](31);
          _didIteratorError3 = true;
          _iteratorError3 = _context10.t0;

        case 39:
          _context10.prev = 39;
          _context10.prev = 40;

          if (!_iteratorNormalCompletion3 && _iterator3["return"] != null) {
            _iterator3["return"]();
          }

        case 42:
          _context10.prev = 42;

          if (!_didIteratorError3) {
            _context10.next = 45;
            break;
          }

          throw _iteratorError3;

        case 45:
          return _context10.finish(42);

        case 46:
          return _context10.finish(39);

        case 47:
          _iteratorNormalCompletion2 = true;
          _context10.next = 26;
          break;

        case 50:
          _context10.next = 56;
          break;

        case 52:
          _context10.prev = 52;
          _context10.t1 = _context10["catch"](24);
          _didIteratorError2 = true;
          _iteratorError2 = _context10.t1;

        case 56:
          _context10.prev = 56;
          _context10.prev = 57;

          if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
            _iterator2["return"]();
          }

        case 59:
          _context10.prev = 59;

          if (!_didIteratorError2) {
            _context10.next = 62;
            break;
          }

          throw _iteratorError2;

        case 62:
          return _context10.finish(59);

        case 63:
          return _context10.finish(56);

        case 64:
          user.dataUsage = dataUsage;
          _context10.next = 67;
          return regeneratorRuntime.awrap(user.save());

        case 67:
          _iteratorNormalCompletion = true;
          _context10.next = 15;
          break;

        case 70:
          _context10.next = 76;
          break;

        case 72:
          _context10.prev = 72;
          _context10.t2 = _context10["catch"](13);
          _didIteratorError = true;
          _iteratorError = _context10.t2;

        case 76:
          _context10.prev = 76;
          _context10.prev = 77;

          if (!_iteratorNormalCompletion && _iterator["return"] != null) {
            _iterator["return"]();
          }

        case 79:
          _context10.prev = 79;

          if (!_didIteratorError) {
            _context10.next = 82;
            break;
          }

          throw _iteratorError;

        case 82:
          return _context10.finish(79);

        case 83:
          return _context10.finish(76);

        case 84:
          return _context10.abrupt("return", res.status(200).json(users));

        case 85:
        case "end":
          return _context10.stop();
      }
    }
  }, null, null, [[13, 72, 76, 84], [24, 52, 56, 64], [31, 35, 39, 47], [40,, 42, 46], [57,, 59, 63], [77,, 79, 83]]);
};

exports.getUsers = getUsers;

var getDeletedUsers = function getDeletedUsers(req, res) {
  var isAdmin, users;
  return regeneratorRuntime.async(function getDeletedUsers$(_context11) {
    while (1) {
      switch (_context11.prev = _context11.next) {
        case 0:
          _context11.next = 2;
          return regeneratorRuntime.awrap(_User["default"].findById({
            _id: req.user._id,
            role: "admin"
          }));

        case 2:
          isAdmin = _context11.sent;

          if (isAdmin) {
            _context11.next = 5;
            break;
          }

          return _context11.abrupt("return", res.status(404).json({
            message: "User not found."
          }));

        case 5:
          _context11.next = 7;
          return regeneratorRuntime.awrap(_DeletedUser["default"].find({}, {
            password: 0
          }));

        case 7:
          users = _context11.sent;

          if (users) {
            _context11.next = 10;
            break;
          }

          return _context11.abrupt("return", res.status(404).json({
            message: "No users found."
          }));

        case 10:
          return _context11.abrupt("return", res.status(200).json(users));

        case 11:
        case "end":
          return _context11.stop();
      }
    }
  });
};

exports.getDeletedUsers = getDeletedUsers;

var getCurrentUser = function getCurrentUser(req, res) {
  var users;
  return regeneratorRuntime.async(function getCurrentUser$(_context12) {
    while (1) {
      switch (_context12.prev = _context12.next) {
        case 0:
          _context12.next = 2;
          return regeneratorRuntime.awrap(_User["default"].findById({
            _id: req.user._id
          }));

        case 2:
          users = _context12.sent;

          if (users) {
            _context12.next = 5;
            break;
          }

          return _context12.abrupt("return", res.status(404).json({
            message: "User not found."
          }));

        case 5:
          return _context12.abrupt("return", res.status(200).json(users));

        case 6:
        case "end":
          return _context12.stop();
      }
    }
  });
};

exports.getCurrentUser = getCurrentUser;

var updateCurrentUser = function updateCurrentUser(req, res) {
  var _req$body6, name, email, password, mediaPath, media, mediaType, newMediaPath, err, user, otherUser, updatedUser;

  return regeneratorRuntime.async(function updateCurrentUser$(_context13) {
    while (1) {
      switch (_context13.prev = _context13.next) {
        case 0:
          _req$body6 = req.body, name = _req$body6.name, email = _req$body6.email, password = _req$body6.password, mediaPath = _req$body6.mediaPath;
          email = email.trim().toLowerCase();
          media = req.file;
          mediaType = undefined, newMediaPath = undefined; // Return the errors if there are any

          err = (0, _expressValidator.validationResult)(req);

          if (err.isEmpty()) {
            _context13.next = 7;
            break;
          }

          return _context13.abrupt("return", res.status(422).json({
            message: err.array()[0].msg
          }));

        case 7:
          _context13.next = 9;
          return regeneratorRuntime.awrap(_User["default"].findById({
            _id: req.user._id
          }));

        case 9:
          user = _context13.sent;

          if (user) {
            _context13.next = 12;
            break;
          }

          return _context13.abrupt("return", res.status(404).json({
            message: "User not found."
          }));

        case 12:
          _context13.next = 14;
          return regeneratorRuntime.awrap(_User["default"].findOne({
            _id: {
              $ne: req.user._id
            },
            email: email
          }));

        case 14:
          otherUser = _context13.sent;

          if (!otherUser) {
            _context13.next = 17;
            break;
          }

          return _context13.abrupt("return", res.status(400).json({
            message: "Email already exists."
          }));

        case 17:
          if (!media) {
            _context13.next = 23;
            break;
          }

          // get the file path
          newMediaPath = "".concat(process.env.UPLOADS_PATH, "/").concat(media.filename); // get the file mediaType

          mediaType = media.mimetype; // if the file mediaType is not an image or an audio file, return an error

          if (!(mediaType !== "image/png" && mediaType !== "image/jpg" && mediaType !== "image/jpeg")) {
            _context13.next = 22;
            break;
          }

          return _context13.abrupt("return", res.status(400).json({
            message: "Valid files are .jpg,.jpeg,.png"
          }));

        case 22:
          mediaType = mediaType.split("/")[0];

        case 23:
          try {
            if (user.mediaPath && newMediaPath) {
              // if there is a new media, remove the media in the uploads folder
              _fs["default"].unlinkSync(_path["default"].join(_dirname, user.mediaPath));
            } else if (user.mediaPath && !mediaPath) {
              // if there is no media, remove the media in the uploads folder
              _fs["default"].unlinkSync(_path["default"].join(_dirname, user.mediaPath));
            }
          } catch (error) {
            console.log(error);
          }

          if (newMediaPath) {
            // if there is a new media, update the media path and media type
            user.mediaPath = newMediaPath;
          } else if (!mediaPath) {
            // if there is no media , remove the media path and media type
            user.mediaPath = undefined;
          } // Update the user


          user.name = name || user.name;
          user.email = email || user.email;

          if (!password) {
            _context13.next = 33;
            break;
          }

          _context13.next = 30;
          return regeneratorRuntime.awrap(_bcryptjs["default"].hash(password, 10));

        case 30:
          _context13.t0 = _context13.sent;
          _context13.next = 34;
          break;

        case 33:
          _context13.t0 = user.password;

        case 34:
          user.password = _context13.t0;
          _context13.next = 37;
          return regeneratorRuntime.awrap(user.save());

        case 37:
          updatedUser = _context13.sent;
          (0, _createSetToken["default"])(res, user._id);
          return _context13.abrupt("return", res.status(200).json({
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            mediaPath: updatedUser.mediaPath,
            isActive: user.isActive
          }));

        case 40:
        case "end":
          return _context13.stop();
      }
    }
  });
};

exports.updateCurrentUser = updateCurrentUser;

var createUser = function createUser(req, res) {
  var uid, _req$body7, name, email, password, isAdmin, userExists, hashed, user, emailTemplate;

  return regeneratorRuntime.async(function createUser$(_context14) {
    while (1) {
      switch (_context14.prev = _context14.next) {
        case 0:
          uid = new _shortUniqueId["default"]({
            length: 6
          });
          _req$body7 = req.body, name = _req$body7.name, email = _req$body7.email, password = _req$body7.password;
          email = email.trim().toLowerCase();

          if (!(!name || !email)) {
            _context14.next = 5;
            break;
          }

          return _context14.abrupt("return", res.status(400).json({
            message: "Please fill in all the fields."
          }));

        case 5:
          _context14.next = 7;
          return regeneratorRuntime.awrap(_User["default"].findById({
            _id: req.user._id,
            role: "admin"
          }));

        case 7:
          isAdmin = _context14.sent;

          if (isAdmin) {
            _context14.next = 10;
            break;
          }

          return _context14.abrupt("return", res.status(404).json({
            message: "Admin can just do this operation."
          }));

        case 10:
          _context14.next = 12;
          return regeneratorRuntime.awrap(_User["default"].findOne({
            email: email
          }));

        case 12:
          userExists = _context14.sent;

          if (!userExists) {
            _context14.next = 15;
            break;
          }

          return _context14.abrupt("return", res.status(400).json({
            message: "Email already exists."
          }));

        case 15:
          if (password === "") {
            password = uid.randomUUID(6);
          } // Create hashed password and email token


          _context14.next = 18;
          return regeneratorRuntime.awrap(_bcryptjs["default"].hash(password, 10));

        case 18:
          hashed = _context14.sent;
          _context14.next = 21;
          return regeneratorRuntime.awrap(_User["default"].create({
            name: name,
            email: email,
            password: hashed,
            registeredWith: ["Email"],
            role: "user",
            isActive: true,
            emailVerified: true
          }));

        case 21:
          user = _context14.sent;
          // Get the email template
          emailTemplate = _fs["default"].readFileSync(_path["default"].resolve(".") + "/backend/views/template-welcome-registration-admin.html", "utf8");
          emailTemplate = emailTemplate.replace(/(\*\*website_name\*\*)/g, "".concat(process.env.SITE_NAME));
          emailTemplate = emailTemplate.replace(/(\*\*login_url\*\*)/g, "".concat(process.env.BASE_URL, "/login"));
          emailTemplate = emailTemplate.replace(/(\*\*name\*\*)/g, name);
          emailTemplate = emailTemplate.replace(/(\*\*email\*\*)/g, email);
          emailTemplate = emailTemplate.replace(/(\*\*password\*\*)/g, password);
          _context14.prev = 28;
          _context14.next = 31;
          return regeneratorRuntime.awrap(_nodemailer["default"].sendMail({
            from: "\"".concat(process.env.SITE_NAME, "\" <").concat(process.env.SMTP_USER, ">"),
            to: email,
            subject: "Welcome to ".concat(process.env.SITE_NAME),
            text: "Hi ".concat(name, ". Admin has registered you in the for signing up! We're excited to have you on board."),
            html: emailTemplate
          }));

        case 31:
          _context14.next = 38;
          break;

        case 33:
          _context14.prev = 33;
          _context14.t0 = _context14["catch"](28);
          _context14.next = 37;
          return regeneratorRuntime.awrap(user.deleteOne());

        case 37:
          return _context14.abrupt("return", res.status(500).json({
            message: "Email address rejected because domain not found."
          }));

        case 38:
          return _context14.abrupt("return", res.status(201).json({
            message: "User created successfully.",
            user: user
          }));

        case 39:
        case "end":
          return _context14.stop();
      }
    }
  }, null, null, [[28, 33]]);
};

exports.createUser = createUser;

var editUser = function editUser(req, res) {
  var isAdmin, _req$body8, userId, name, email, password, isActive, userExists, user;

  return regeneratorRuntime.async(function editUser$(_context15) {
    while (1) {
      switch (_context15.prev = _context15.next) {
        case 0:
          _context15.next = 2;
          return regeneratorRuntime.awrap(_User["default"].findById({
            _id: req.user._id,
            role: "admin"
          }));

        case 2:
          isAdmin = _context15.sent;

          if (isAdmin) {
            _context15.next = 5;
            break;
          }

          return _context15.abrupt("return", res.status(404).json({
            message: "Admin can just do this operation."
          }));

        case 5:
          console.log("req.body", req.body);
          _req$body8 = req.body, userId = _req$body8.userId, name = _req$body8.name, email = _req$body8.email, password = _req$body8.password, isActive = _req$body8.isActive;
          email = email.trim().toLowerCase();

          if (!(!name || !email)) {
            _context15.next = 10;
            break;
          }

          return _context15.abrupt("return", res.status(400).json({
            message: "Please give name and email."
          }));

        case 10:
          _context15.next = 12;
          return regeneratorRuntime.awrap(_User["default"].findOne({
            _id: {
              $ne: userId
            },
            email: email
          }));

        case 12:
          userExists = _context15.sent;

          if (!userExists) {
            _context15.next = 15;
            break;
          }

          return _context15.abrupt("return", res.status(400).json({
            message: "Email already exists."
          }));

        case 15:
          if (!(password !== "")) {
            _context15.next = 19;
            break;
          }

          _context15.next = 18;
          return regeneratorRuntime.awrap(_bcryptjs["default"].hash(password, 10));

        case 18:
          password = _context15.sent;

        case 19:
          _context15.next = 21;
          return regeneratorRuntime.awrap(_User["default"].findById({
            _id: userId
          }));

        case 21:
          user = _context15.sent;

          if (user) {
            _context15.next = 24;
            break;
          }

          return _context15.abrupt("return", res.status(404).json({
            message: "User not found."
          }));

        case 24:
          // Update the user
          user.name = name || user.name;
          user.email = email || user.email;
          user.password = password || user.password;
          user.isActive = isActive ? true : false;
          _context15.next = 30;
          return regeneratorRuntime.awrap(user.save());

        case 30:
          return _context15.abrupt("return", res.status(201).json({
            message: "User updated successfully."
          }));

        case 31:
        case "end":
          return _context15.stop();
      }
    }
  });
};

exports.editUser = editUser;

var deleteUser = function deleteUser(req, res) {
  var userId, isAdmin, user, mediaFiles, userBoxes, _iteratorNormalCompletion4, _didIteratorError4, _iteratorError4, _iterator4, _step4, box;

  return regeneratorRuntime.async(function deleteUser$(_context16) {
    while (1) {
      switch (_context16.prev = _context16.next) {
        case 0:
          userId = req.body.userId;

          if (userId) {
            _context16.next = 3;
            break;
          }

          return _context16.abrupt("return", res.status(400).json({
            message: "Please provide a userId."
          }));

        case 3:
          _context16.next = 5;
          return regeneratorRuntime.awrap(_User["default"].findById({
            _id: req.user._id,
            role: "admin"
          }));

        case 5:
          isAdmin = _context16.sent;

          if (isAdmin) {
            _context16.next = 8;
            break;
          }

          return _context16.abrupt("return", res.status(404).json({
            message: "Admin can just do this operation."
          }));

        case 8:
          _context16.next = 10;
          return regeneratorRuntime.awrap(_User["default"].findById({
            _id: userId
          }));

        case 10:
          user = _context16.sent;

          if (user) {
            _context16.next = 13;
            break;
          }

          return _context16.abrupt("return", res.status(404).json({
            message: "User not found."
          }));

        case 13:
          try {
            // Remove all media files that have the user ID as the first part of the filename
            mediaFiles = _fs["default"].readdirSync(_path["default"].join(_dirname, process.env.UPLOADS_PATH));
            mediaFiles.forEach(function (file) {
              var _file$split = file.split("-"),
                  _file$split2 = _slicedToArray(_file$split, 1),
                  fileUserId = _file$split2[0];

              if (fileUserId === user._id.toString()) {
                var deletedPath = _path["default"].join(_dirname, process.env.DELETED_UPLOADS_PATH, file);

                _fs["default"].renameSync(_path["default"].join(_dirname, process.env.UPLOADS_PATH, file), deletedPath);
              }
            });
          } catch (error) {
            console.log(error);
          } // Move user to DeletedUser model and delete from User model


          if (user.emailDeleteToken && user.emailDeleteTokenExpiresAt) {
            user.emailDeleteToken = undefined;
            user.emailDeleteTokenExpiresAt = undefined;
          }

          user.deletedAt = Date.now();
          _context16.next = 18;
          return regeneratorRuntime.awrap(_DeletedUser["default"].create(user.toObject()));

        case 18:
          _context16.next = 20;
          return regeneratorRuntime.awrap(user.deleteOne());

        case 20:
          _context16.next = 22;
          return regeneratorRuntime.awrap(_Box["default"].find({
            user: req.user._id
          }));

        case 22:
          userBoxes = _context16.sent;
          _iteratorNormalCompletion4 = true;
          _didIteratorError4 = false;
          _iteratorError4 = undefined;
          _context16.prev = 26;
          _iterator4 = userBoxes[Symbol.iterator]();

        case 28:
          if (_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done) {
            _context16.next = 39;
            break;
          }

          box = _step4.value;
          box.deletedAt = Date.now();
          box.items.forEach(function (item) {
            if (item.mediaPath) {
              item.mediaPath = item.mediaPath.replace(process.env.UPLOADS_PATH, process.env.DELETED_UPLOADS_PATH);
            }
          });
          _context16.next = 34;
          return regeneratorRuntime.awrap(_DeletedBox["default"].create(box.toObject()));

        case 34:
          _context16.next = 36;
          return regeneratorRuntime.awrap(box.deleteOne());

        case 36:
          _iteratorNormalCompletion4 = true;
          _context16.next = 28;
          break;

        case 39:
          _context16.next = 45;
          break;

        case 41:
          _context16.prev = 41;
          _context16.t0 = _context16["catch"](26);
          _didIteratorError4 = true;
          _iteratorError4 = _context16.t0;

        case 45:
          _context16.prev = 45;
          _context16.prev = 46;

          if (!_iteratorNormalCompletion4 && _iterator4["return"] != null) {
            _iterator4["return"]();
          }

        case 48:
          _context16.prev = 48;

          if (!_didIteratorError4) {
            _context16.next = 51;
            break;
          }

          throw _iteratorError4;

        case 51:
          return _context16.finish(48);

        case 52:
          return _context16.finish(45);

        case 53:
          return _context16.abrupt("return", res.status(200).json({
            message: "User has been deleted."
          }));

        case 54:
        case "end":
          return _context16.stop();
      }
    }
  }, null, null, [[26, 41, 45, 53], [46,, 48, 52]]);
};

exports.deleteUser = deleteUser;

var recoverUser = function recoverUser(req, res) {
  var userId, isAdmin, deletedUser, mediaFiles, deletedBoxes, _iteratorNormalCompletion5, _didIteratorError5, _iteratorError5, _iterator5, _step5, deletedBox;

  return regeneratorRuntime.async(function recoverUser$(_context17) {
    while (1) {
      switch (_context17.prev = _context17.next) {
        case 0:
          userId = req.body.userId;

          if (userId) {
            _context17.next = 3;
            break;
          }

          return _context17.abrupt("return", res.status(400).json({
            message: "Please provide a userId."
          }));

        case 3:
          _context17.next = 5;
          return regeneratorRuntime.awrap(_User["default"].findById({
            _id: req.user._id,
            role: "admin"
          }));

        case 5:
          isAdmin = _context17.sent;

          if (isAdmin) {
            _context17.next = 8;
            break;
          }

          return _context17.abrupt("return", res.status(404).json({
            message: "Admin can just do this operation."
          }));

        case 8:
          _context17.next = 10;
          return regeneratorRuntime.awrap(_DeletedUser["default"].findById({
            _id: userId
          }));

        case 10:
          deletedUser = _context17.sent;

          if (deletedUser) {
            _context17.next = 13;
            break;
          }

          return _context17.abrupt("return", res.status(404).json({
            message: "User not found."
          }));

        case 13:
          try {
            // Move all media files that have the user ID from the deleted-uploads to uploads as the first part of the filename
            mediaFiles = _fs["default"].readdirSync(_path["default"].join(_dirname, process.env.DELETED_UPLOADS_PATH));
            mediaFiles.forEach(function (file) {
              var _file$split3 = file.split("-"),
                  _file$split4 = _slicedToArray(_file$split3, 1),
                  fileUserId = _file$split4[0];

              if (fileUserId === deletedUser._id.toString()) {
                _fs["default"].renameSync(_path["default"].join(_dirname, process.env.DELETED_UPLOADS_PATH, file), _path["default"].join(_dirname, process.env.UPLOADS_PATH, file) // Move the file back to the uploads folder
                );
              }
            });
          } catch (error) {
            console.log(error);
          }

          deleteUser.deletedAt = undefined; // Move back user from deletedUser model to User model

          _context17.next = 17;
          return regeneratorRuntime.awrap(_User["default"].create(deletedUser.toObject()));

        case 17:
          _context17.next = 19;
          return regeneratorRuntime.awrap(deletedUser.deleteOne());

        case 19:
          _context17.next = 21;
          return regeneratorRuntime.awrap(_DeletedBox["default"].find({
            user: req.user._id
          }));

        case 21:
          deletedBoxes = _context17.sent;
          _iteratorNormalCompletion5 = true;
          _didIteratorError5 = false;
          _iteratorError5 = undefined;
          _context17.prev = 25;
          _iterator5 = deletedBoxes[Symbol.iterator]();

        case 27:
          if (_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done) {
            _context17.next = 38;
            break;
          }

          deletedBox = _step5.value;
          deletedBox.deletedAt = undefined;
          deletedBox.items.forEach(function (item) {
            if (item.mediaPath) {
              item.mediaPath = item.mediaPath.replace(process.env.DELETED_UPLOADS_PATH, process.env.UPLOADS_PATH);
            }
          });
          _context17.next = 33;
          return regeneratorRuntime.awrap(_Box["default"].create(deletedBox.toObject()));

        case 33:
          _context17.next = 35;
          return regeneratorRuntime.awrap(deletedBox.deleteOne());

        case 35:
          _iteratorNormalCompletion5 = true;
          _context17.next = 27;
          break;

        case 38:
          _context17.next = 44;
          break;

        case 40:
          _context17.prev = 40;
          _context17.t0 = _context17["catch"](25);
          _didIteratorError5 = true;
          _iteratorError5 = _context17.t0;

        case 44:
          _context17.prev = 44;
          _context17.prev = 45;

          if (!_iteratorNormalCompletion5 && _iterator5["return"] != null) {
            _iterator5["return"]();
          }

        case 47:
          _context17.prev = 47;

          if (!_didIteratorError5) {
            _context17.next = 50;
            break;
          }

          throw _iteratorError5;

        case 50:
          return _context17.finish(47);

        case 51:
          return _context17.finish(44);

        case 52:
          return _context17.abrupt("return", res.status(200).json({
            message: "User has been recovered."
          }));

        case 53:
        case "end":
          return _context17.stop();
      }
    }
  }, null, null, [[25, 40, 44, 52], [45,, 47, 51]]);
};

exports.recoverUser = recoverUser;

var changeUserStatus = function changeUserStatus(req, res) {
  var _req$body9, userId, isActive, isAdmin, user;

  return regeneratorRuntime.async(function changeUserStatus$(_context18) {
    while (1) {
      switch (_context18.prev = _context18.next) {
        case 0:
          _req$body9 = req.body, userId = _req$body9.userId, isActive = _req$body9.isActive;

          if (userId) {
            _context18.next = 3;
            break;
          }

          return _context18.abrupt("return", res.status(400).json({
            message: "Please provide a userId."
          }));

        case 3:
          _context18.next = 5;
          return regeneratorRuntime.awrap(_User["default"].findById({
            _id: req.user._id,
            role: "admin"
          }));

        case 5:
          isAdmin = _context18.sent;

          if (isAdmin) {
            _context18.next = 8;
            break;
          }

          return _context18.abrupt("return", res.status(404).json({
            message: "Admin can just do this operation."
          }));

        case 8:
          _context18.next = 10;
          return regeneratorRuntime.awrap(_User["default"].findById({
            _id: userId
          }));

        case 10:
          user = _context18.sent;

          if (user) {
            _context18.next = 13;
            break;
          }

          return _context18.abrupt("return", res.status(404).json({
            message: "User not found."
          }));

        case 13:
          // Update the user
          user.isActive = isActive ? true : false;
          _context18.next = 16;
          return regeneratorRuntime.awrap(user.save());

        case 16:
          return _context18.abrupt("return", res.status(201).json({
            message: "User status updated successfully."
          }));

        case 17:
        case "end":
          return _context18.stop();
      }
    }
  });
};

exports.changeUserStatus = changeUserStatus;

var deleteCurrentUser = function deleteCurrentUser(req, res) {
  var token, user, mediaFiles, userBoxes, _iteratorNormalCompletion6, _didIteratorError6, _iteratorError6, _iterator6, _step6, box;

  return regeneratorRuntime.async(function deleteCurrentUser$(_context19) {
    while (1) {
      switch (_context19.prev = _context19.next) {
        case 0:
          token = req.query.token; // Find the user

          _context19.next = 3;
          return regeneratorRuntime.awrap(_User["default"].findOne({
            _id: req.user._id,
            emailDeleteToken: token,
            emailDeleteTokenExpiresAt: {
              $gt: Date.now()
            }
          }));

        case 3:
          user = _context19.sent;

          if (user) {
            _context19.next = 6;
            break;
          }

          return _context19.abrupt("return", res.status(404).json({
            message: "User not found."
          }));

        case 6:
          try {
            // Remove all media files that have the user ID as the first part of the filename
            mediaFiles = _fs["default"].readdirSync(_path["default"].join(_dirname, process.env.UPLOADS_PATH));
            mediaFiles.forEach(function (file) {
              var _file$split5 = file.split("-"),
                  _file$split6 = _slicedToArray(_file$split5, 1),
                  fileUserId = _file$split6[0];

              if (fileUserId === req.user._id.toString()) {
                var deletedPath = _path["default"].join(_dirname, process.env.DELETED_UPLOADS_PATH, file);

                _fs["default"].renameSync(_path["default"].join(_dirname, process.env.UPLOADS_PATH, file), deletedPath);
              }
            });
          } catch (error) {
            console.log(error);
          } // Move user to DeletedUser model and delete from User model


          if (user.emailDeleteToken && user.emailDeleteTokenExpiresAt) {
            user.emailDeleteToken = undefined;
            user.emailDeleteTokenExpiresAt = undefined;
          }

          user.deletedAt = Date.now();
          _context19.next = 11;
          return regeneratorRuntime.awrap(_DeletedUser["default"].create(user.toObject()));

        case 11:
          _context19.next = 13;
          return regeneratorRuntime.awrap(user.deleteOne());

        case 13:
          _context19.next = 15;
          return regeneratorRuntime.awrap(_Box["default"].find({
            user: req.user._id
          }));

        case 15:
          userBoxes = _context19.sent;
          _iteratorNormalCompletion6 = true;
          _didIteratorError6 = false;
          _iteratorError6 = undefined;
          _context19.prev = 19;
          _iterator6 = userBoxes[Symbol.iterator]();

        case 21:
          if (_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done) {
            _context19.next = 32;
            break;
          }

          box = _step6.value;
          box.deletedAt = Date.now();
          box.items.forEach(function (item) {
            if (item.mediaPath) {
              item.mediaPath = item.mediaPath.replace(process.env.UPLOADS_PATH, process.env.DELETED_UPLOADS_PATH);
            }
          });
          _context19.next = 27;
          return regeneratorRuntime.awrap(_DeletedBox["default"].create(box.toObject()));

        case 27:
          _context19.next = 29;
          return regeneratorRuntime.awrap(box.deleteOne());

        case 29:
          _iteratorNormalCompletion6 = true;
          _context19.next = 21;
          break;

        case 32:
          _context19.next = 38;
          break;

        case 34:
          _context19.prev = 34;
          _context19.t0 = _context19["catch"](19);
          _didIteratorError6 = true;
          _iteratorError6 = _context19.t0;

        case 38:
          _context19.prev = 38;
          _context19.prev = 39;

          if (!_iteratorNormalCompletion6 && _iterator6["return"] != null) {
            _iterator6["return"]();
          }

        case 41:
          _context19.prev = 41;

          if (!_didIteratorError6) {
            _context19.next = 44;
            break;
          }

          throw _iteratorError6;

        case 44:
          return _context19.finish(41);

        case 45:
          return _context19.finish(38);

        case 46:
          // Clear the cookie
          res.clearCookie("JWTMERNMoveOut");
          return _context19.abrupt("return", res.status(200).json({
            message: "Your account has been successfully deleted. We're sorry to see you go."
          }));

        case 48:
        case "end":
          return _context19.stop();
      }
    }
  }, null, null, [[19, 34, 38, 46], [39,, 41, 45]]);
};

exports.deleteCurrentUser = deleteCurrentUser;

var getNamesAndEmails = function getNamesAndEmails(req, res) {
  var user, users;
  return regeneratorRuntime.async(function getNamesAndEmails$(_context20) {
    while (1) {
      switch (_context20.prev = _context20.next) {
        case 0:
          _context20.next = 2;
          return regeneratorRuntime.awrap(_User["default"].findOne({
            _id: req.user._id,
            isActive: true
          }));

        case 2:
          user = _context20.sent;

          if (user) {
            _context20.next = 5;
            break;
          }

          return _context20.abrupt("return", res.status(400).json({
            message: "User is inactive."
          }));

        case 5:
          _context20.next = 7;
          return regeneratorRuntime.awrap(_User["default"].find({
            email: {
              $ne: req.user.email
            }
          }, {
            email: 1,
            name: 1,
            _id: 0
          }));

        case 7:
          users = _context20.sent;

          if (users) {
            _context20.next = 10;
            break;
          }

          return _context20.abrupt("return", res.status(404).json({
            message: "No email and name exists"
          }));

        case 10:
          return _context20.abrupt("return", res.status(200).json(users));

        case 11:
        case "end":
          return _context20.stop();
      }
    }
  });
};

exports.getNamesAndEmails = getNamesAndEmails;

var shareBox = function shareBox(req, res) {
  var _req$body10, boxId, email, uid, err, user, box, newBox, emailTemplate;

  return regeneratorRuntime.async(function shareBox$(_context21) {
    while (1) {
      switch (_context21.prev = _context21.next) {
        case 0:
          _req$body10 = req.body, boxId = _req$body10.boxId, email = _req$body10.email;
          uid = new _shortUniqueId["default"]({
            length: 6,
            dictionary: "number"
          }); // show the error if there is any

          if (!(!boxId || !email)) {
            _context21.next = 4;
            break;
          }

          return _context21.abrupt("return", res.status(400).json({
            message: "Box ID and email are required."
          }));

        case 4:
          err = (0, _expressValidator.validationResult)(req);

          if (err.isEmpty()) {
            _context21.next = 7;
            break;
          }

          return _context21.abrupt("return", res.status(422).json({
            message: err.array()[0].msg
          }));

        case 7:
          _context21.next = 9;
          return regeneratorRuntime.awrap(_User["default"].findOne({
            email: email
          }));

        case 9:
          user = _context21.sent;

          if (user) {
            _context21.next = 12;
            break;
          }

          return _context21.abrupt("return", res.status(400).json({
            message: "User not found."
          }));

        case 12:
          if (user.isActive) {
            _context21.next = 14;
            break;
          }

          return _context21.abrupt("return", res.status(400).json({
            message: "User is inactive."
          }));

        case 14:
          _context21.next = 16;
          return regeneratorRuntime.awrap(_Box["default"].findOne({
            _id: boxId
          }));

        case 16:
          box = _context21.sent;

          if (box) {
            _context21.next = 19;
            break;
          }

          return _context21.abrupt("return", res.status(400).json({
            message: "Box not found."
          }));

        case 19:
          _context21.next = 21;
          return regeneratorRuntime.awrap(_Box["default"].create({
            name: box.name,
            description: box.description,
            items: box.items,
            labelNum: box.labelNum,
            isPrivate: box.isPrivate,
            privateCode: box.privateCode ? uid.randomUUID(6) : undefined,
            user: user._id
          }));

        case 21:
          newBox = _context21.sent;
          // Add the box to the user's box list
          user.boxes.push(newBox._id);
          _context21.next = 25;
          return regeneratorRuntime.awrap(user.save());

        case 25:
          // Get the email template for sharing a box
          emailTemplate = _fs["default"].readFileSync(_path["default"].resolve(".") + "/backend/views/template-share-label-or-box.html", "utf8");
          emailTemplate = emailTemplate.replace(/(\*\*email_link\*\*)/g, "".concat(process.env.BASE_URL, "/boxes/").concat(newBox._id, "/items"));
          emailTemplate = emailTemplate.replace(/(\*\*name_from\*\*)/g, req.user.name);
          emailTemplate = emailTemplate.replace(/(\*\*name_to\*\*)/g, user.name);
          emailTemplate = emailTemplate.replace(/(\*\*shared_object\*\*)/g, "box");
          emailTemplate = emailTemplate.replace(/(\*\*privateCode\*\*)/g, "");
          _context21.prev = 31;
          _context21.next = 34;
          return regeneratorRuntime.awrap(_nodemailer["default"].sendMail({
            from: "\"".concat(process.env.SITE_NAME, "\" <").concat(process.env.SMTP_USER, ">"),
            to: email,
            subject: "A box has been shared with you.",
            text: "".concat(user.name, " has shared a box with you. You can click on the link below to view the box."),
            html: emailTemplate
          }));

        case 34:
          _context21.next = 39;
          break;

        case 36:
          _context21.prev = 36;
          _context21.t0 = _context21["catch"](31);
          return _context21.abrupt("return", res.status(500).json({
            message: "Email address rejected because domain not found."
          }));

        case 39:
          return _context21.abrupt("return", res.status(200).json({
            message: "Box shared successfully."
          }));

        case 40:
        case "end":
          return _context21.stop();
      }
    }
  }, null, null, [[31, 36]]);
};

exports.shareBox = shareBox;

var shareLabel = function shareLabel(req, res) {
  var _req$body11, labelId, email, uid, err, label, user, emailTemplate;

  return regeneratorRuntime.async(function shareLabel$(_context22) {
    while (1) {
      switch (_context22.prev = _context22.next) {
        case 0:
          _req$body11 = req.body, labelId = _req$body11.labelId, email = _req$body11.email;
          uid = new _shortUniqueId["default"]({
            length: 6,
            dictionary: "number"
          }); // show the error if there is any

          if (!(!labelId || !email)) {
            _context22.next = 4;
            break;
          }

          return _context22.abrupt("return", res.status(400).json({
            message: "Box ID and email are required."
          }));

        case 4:
          err = (0, _expressValidator.validationResult)(req);

          if (err.isEmpty()) {
            _context22.next = 7;
            break;
          }

          return _context22.abrupt("return", res.status(422).json({
            message: err.array()[0].msg
          }));

        case 7:
          _context22.next = 9;
          return regeneratorRuntime.awrap(_Box["default"].findOne({
            _id: labelId
          }));

        case 9:
          label = _context22.sent;

          if (label) {
            _context22.next = 12;
            break;
          }

          return _context22.abrupt("return", res.status(400).json({
            message: "Label not found."
          }));

        case 12:
          _context22.next = 14;
          return regeneratorRuntime.awrap(_User["default"].findOne({
            email: email
          }));

        case 14:
          user = _context22.sent;

          if (user) {
            _context22.next = 17;
            break;
          }

          return _context22.abrupt("return", res.status(400).json({
            message: "User not found."
          }));

        case 17:
          if (user.isActive) {
            _context22.next = 19;
            break;
          }

          return _context22.abrupt("return", res.status(400).json({
            message: "User is inactive."
          }));

        case 19:
          // Get the email template for sharing a box
          emailTemplate = _fs["default"].readFileSync(_path["default"].resolve(".") + "/backend/views/template-share-label-or-box.html", "utf8");
          emailTemplate = emailTemplate.replace(/(\*\*email_link\*\*)/g, "".concat(process.env.BASE_URL, "/boxes/").concat(labelId));
          emailTemplate = emailTemplate.replace(/(\*\*name_from\*\*)/g, req.user.name);
          emailTemplate = emailTemplate.replace(/(\*\*name_to\*\*)/g, user.name);
          emailTemplate = emailTemplate.replace(/(\*\*shared_object\*\*)/g, "label");

          if (label.isPrivate) {
            emailTemplate = emailTemplate.replace(/(\*\*privateCode\*\*)/g, "<p>The private code is: <strong>".concat(label.privateCode, "</strong></p> "));
          } else {
            emailTemplate = emailTemplate.replace(/(\*\*privateCode\*\*)/g, "");
          }

          _context22.prev = 25;
          _context22.next = 28;
          return regeneratorRuntime.awrap(_nodemailer["default"].sendMail({
            from: "\"".concat(process.env.SITE_NAME, "\" <").concat(process.env.SMTP_USER, ">"),
            to: email,
            subject: "A label has been shared with you.",
            text: "".concat(user.name, " has shared a label with you. You can click on the link below to view the label."),
            html: emailTemplate
          }));

        case 28:
          _context22.next = 33;
          break;

        case 30:
          _context22.prev = 30;
          _context22.t0 = _context22["catch"](25);
          return _context22.abrupt("return", res.status(500).json({
            message: "Email address rejected because domain not found."
          }));

        case 33:
          return _context22.abrupt("return", res.status(200).json({
            message: "Label shared successfully."
          }));

        case 34:
        case "end":
          return _context22.stop();
      }
    }
  }, null, null, [[25, 30]]);
};

exports.shareLabel = shareLabel;

var deactivateCurrentUser = function deactivateCurrentUser(req, res) {
  var user, emailTemplate, name, email, role, isActive, mediaPath;
  return regeneratorRuntime.async(function deactivateCurrentUser$(_context23) {
    while (1) {
      switch (_context23.prev = _context23.next) {
        case 0:
          _context23.next = 2;
          return regeneratorRuntime.awrap(_User["default"].findOne({
            _id: req.user._id
          }));

        case 2:
          user = _context23.sent;

          if (user) {
            _context23.next = 5;
            break;
          }

          return _context23.abrupt("return", res.status(404).json({
            message: "User not found."
          }));

        case 5:
          if (user.isActive) {
            _context23.next = 7;
            break;
          }

          return _context23.abrupt("return", res.status(400).json({
            message: "User is inactive."
          }));

        case 7:
          // Deactivate the user
          user.isActive = false;
          _context23.next = 10;
          return regeneratorRuntime.awrap(user.save());

        case 10:
          // Get the email template
          emailTemplate = _fs["default"].readFileSync(_path["default"].resolve(".") + "/backend/views/template-deactive-reactive-user.html", "utf8");
          emailTemplate = emailTemplate.replace(/(\*\*login_link\*\*)/g, "".concat(process.env.BASE_URL, "/login"));
          emailTemplate = emailTemplate.replace(/(\*\*name\*\*)/g, user.name);
          _context23.prev = 13;
          _context23.next = 16;
          return regeneratorRuntime.awrap(_nodemailer["default"].sendMail({
            from: "\"".concat(process.env.SITE_NAME, "\" <").concat(process.env.SMTP_USER, ">"),
            to: user.email,
            subject: "Your account has been deactivated.",
            html: emailTemplate
          }));

        case 16:
          _context23.next = 21;
          break;

        case 18:
          _context23.prev = 18;
          _context23.t0 = _context23["catch"](13);
          return _context23.abrupt("return", res.status(500).json({
            message: "Email address rejected because domain not found."
          }));

        case 21:
          name = user.name, email = user.email, role = user.role, isActive = user.isActive, mediaPath = user.mediaPath;
          return _context23.abrupt("return", res.status(200).json({
            message: "User deactivated successfully.",
            user: {
              name: name,
              email: email,
              role: role,
              isActive: isActive,
              mediaPath: mediaPath
            }
          }));

        case 23:
        case "end":
          return _context23.stop();
      }
    }
  }, null, null, [[13, 18]]);
};

exports.deactivateCurrentUser = deactivateCurrentUser;

var reactivateCurrentUser = function reactivateCurrentUser(req, res) {
  var user, name, email, role, isActive, mediaPath;
  return regeneratorRuntime.async(function reactivateCurrentUser$(_context24) {
    while (1) {
      switch (_context24.prev = _context24.next) {
        case 0:
          _context24.next = 2;
          return regeneratorRuntime.awrap(_User["default"].findOne({
            _id: req.user._id
          }));

        case 2:
          user = _context24.sent;

          if (user) {
            _context24.next = 5;
            break;
          }

          return _context24.abrupt("return", res.status(404).json({
            message: "User not found."
          }));

        case 5:
          if (!user.isActive) {
            _context24.next = 7;
            break;
          }

          return _context24.abrupt("return", res.status(400).json({
            message: "User is active."
          }));

        case 7:
          // Deactivate the user
          user.isActive = true;
          _context24.next = 10;
          return regeneratorRuntime.awrap(user.save());

        case 10:
          name = user.name, email = user.email, role = user.role, isActive = user.isActive, mediaPath = user.mediaPath;
          return _context24.abrupt("return", res.status(200).json({
            message: "User reactivated successfully.",
            user: {
              name: name,
              email: email,
              role: role,
              isActive: isActive,
              mediaPath: mediaPath
            }
          }));

        case 12:
        case "end":
          return _context24.stop();
      }
    }
  });
};

exports.reactivateCurrentUser = reactivateCurrentUser;

var sendDeleteEmail = function sendDeleteEmail(req, res) {
  var user, emailToken, emailDeleteToken, emailDeleteTokenExpiresAt, emailTemplate, name, email, role, isActive, mediaPath;
  return regeneratorRuntime.async(function sendDeleteEmail$(_context25) {
    while (1) {
      switch (_context25.prev = _context25.next) {
        case 0:
          _context25.next = 2;
          return regeneratorRuntime.awrap(_User["default"].findOne({
            _id: req.user._id
          }));

        case 2:
          user = _context25.sent;

          if (user) {
            _context25.next = 5;
            break;
          }

          return _context25.abrupt("return", res.status(404).json({
            message: "User not found."
          }));

        case 5:
          if (!user.isActive) {
            _context25.next = 7;
            break;
          }

          return _context25.abrupt("return", res.status(400).json({
            message: "User is active."
          }));

        case 7:
          emailToken = _crypto["default"].randomBytes(32).toString("hex");
          emailDeleteToken = _crypto["default"].createHash("sha256").update(emailToken).digest("hex");
          emailDeleteTokenExpiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days
          // update the user

          user.emailDeleteToken = emailDeleteToken;
          user.emailDeleteTokenExpiresAt = emailDeleteTokenExpiresAt;
          _context25.next = 14;
          return regeneratorRuntime.awrap(user.save());

        case 14:
          // Get the email template
          emailTemplate = _fs["default"].readFileSync(_path["default"].resolve(".") + "/backend/views/template-email-delete-user.html", "utf8");
          emailTemplate = emailTemplate.replace(/(\*\*delete_link\*\*)/g, "".concat(process.env.BASE_URL, "/delete-account/").concat(emailDeleteToken));
          emailTemplate = emailTemplate.replace(/(\*\*name\*\*)/g, user.name);
          _context25.prev = 17;
          _context25.next = 20;
          return regeneratorRuntime.awrap(_nodemailer["default"].sendMail({
            from: "\"".concat(process.env.SITE_NAME, "\" <").concat(process.env.SMTP_USER, ">"),
            to: user.email,
            subject: "Verify Your Account Deletion Request",
            html: emailTemplate
          }));

        case 20:
          _context25.next = 25;
          break;

        case 22:
          _context25.prev = 22;
          _context25.t0 = _context25["catch"](17);
          return _context25.abrupt("return", res.status(500).json({
            message: "Email address rejected because domain not found."
          }));

        case 25:
          name = user.name, email = user.email, role = user.role, isActive = user.isActive, mediaPath = user.mediaPath;
          return _context25.abrupt("return", res.status(200).json({
            message: "Delete confirmation email sent successfully.",
            user: {
              name: name,
              email: email,
              role: role,
              isActive: isActive,
              mediaPath: mediaPath
            }
          }));

        case 27:
        case "end":
          return _context25.stop();
      }
    }
  }, null, null, [[17, 22]]);
};

exports.sendDeleteEmail = sendDeleteEmail;
var _default = {
  register: register,
  registerWithGoogle: registerWithGoogle,
  login: login,
  loginWithGoogle: loginWithGoogle,
  logout: logout,
  verifyEmail: verifyEmail,
  sendVerificationEmail: sendVerificationEmail,
  sendResetPasswordEmail: sendResetPasswordEmail,
  verifyTokenResetPassword: verifyTokenResetPassword,
  updateUserPasswordById: updateUserPasswordById,
  getUsers: getUsers,
  getDeletedUsers: getDeletedUsers,
  getCurrentUser: getCurrentUser,
  updateCurrentUser: updateCurrentUser,
  createUser: createUser,
  editUser: editUser,
  deleteUser: deleteUser,
  recoverUser: recoverUser,
  changeUserStatus: changeUserStatus,
  deleteCurrentUser: deleteCurrentUser,
  getNamesAndEmails: getNamesAndEmails,
  shareBox: shareBox,
  shareLabel: shareLabel,
  deactivateCurrentUser: deactivateCurrentUser,
  reactivateCurrentUser: reactivateCurrentUser,
  sendDeleteEmail: sendDeleteEmail
};
exports["default"] = _default;