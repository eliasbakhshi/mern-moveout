"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.updateUserPasswordById = exports.verifyTokenResetPassword = exports.sendResetPasswordEmail = exports.sendVerificationEmail = exports.verifyEmail = exports.deleteCurrentUser = exports.updateCurrentUser = exports.getCurrentUser = exports.logout = exports.login = exports.register = void 0;

var _User = _interopRequireDefault(require("../models/User.js"));

var _bcryptjs = _interopRequireDefault(require("bcryptjs"));

var _expressValidator = require("express-validator");

var _createSetToken = _interopRequireDefault(require("../middlewares/createSetToken.js"));

var _nodemailer = _interopRequireDefault(require("../config/nodemailer.js"));

var _crypto = _interopRequireDefault(require("crypto"));

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

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
            emailVerificationTokenExpiresAt: emailVerificationTokenExpiresAt
          }));

        case 17:
          user = _context.sent;
          // Get the email template
          emailTemplate = _fs["default"].readFileSync(_path["default"].resolve(".") + "/backend/views/template-email-verification.html", "utf8");
          emailTemplate = emailTemplate.replace("**email_link**", "".concat(process.env.BASE_URL, "/verify-email/").concat(emailVerificationToken));
          emailTemplate = emailTemplate.replace("**name**", name);
          _context.prev = 21;
          _context.next = 24;
          return regeneratorRuntime.awrap(_nodemailer["default"].sendMail({
            from: "\"".concat(process.env.SITE_NAME, "\" <").concat(process.env.SMTP_USER, ">"),
            to: email,
            subject: "Please verify your email.",
            text: "Thank you ".concat(name, " for signing up! We're excited to have you on board."),
            html: emailTemplate
          }));

        case 24:
          _context.next = 31;
          break;

        case 26:
          _context.prev = 26;
          _context.t0 = _context["catch"](21);
          _context.next = 30;
          return regeneratorRuntime.awrap(user.deleteOne());

        case 30:
          return _context.abrupt("return", res.status(500).json({
            message: "Email address rejected because domain not found."
          }));

        case 31:
          return _context.abrupt("return", res.status(201).json({
            message: "User created successfully."
          }));

        case 32:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[21, 26]]);
};

exports.register = register;

var login = function login(req, res, next) {
  var _req$body2, email, password, remember, err, user, valid;

  return regeneratorRuntime.async(function login$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _req$body2 = req.body, email = _req$body2.email, password = _req$body2.password, remember = _req$body2.remember;
          email = email.trim().toLowerCase();

          if (!(!email || !password)) {
            _context2.next = 4;
            break;
          }

          return _context2.abrupt("return", res.status(400).json({
            message: "Please fill in all the fields."
          }));

        case 4:
          // Validate the email and password
          err = (0, _expressValidator.validationResult)(req);

          if (err.isEmpty()) {
            _context2.next = 7;
            break;
          }

          return _context2.abrupt("return", res.status(422).json({
            message: err.array()[0].msg
          }));

        case 7:
          _context2.next = 9;
          return regeneratorRuntime.awrap(_User["default"].findOne({
            email: email
          }));

        case 9:
          user = _context2.sent;

          if (user) {
            _context2.next = 12;
            break;
          }

          return _context2.abrupt("return", res.status(400).json({
            message: "User not found."
          }));

        case 12:
          if (user.emailVerified) {
            _context2.next = 14;
            break;
          }

          return _context2.abrupt("return", res.status(400).json({
            message: "Please verify your email."
          }));

        case 14:
          _context2.next = 16;
          return regeneratorRuntime.awrap(_bcryptjs["default"].compare(password, user.password));

        case 16:
          valid = _context2.sent;

          if (valid) {
            _context2.next = 19;
            break;
          }

          return _context2.abrupt("return", res.status(400).json({
            message: "Invalid email or password."
          }));

        case 19:
          // Create and set a token
          (0, _createSetToken["default"])(res, user._id, remember);
          return _context2.abrupt("return", res.status(200).json({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            mediaPath: user.mediaPath
          }));

        case 21:
        case "end":
          return _context2.stop();
      }
    }
  });
};

exports.login = login;

var logout = function logout(req, res, next) {
  // Clear the cookie
  res.clearCookie("JWTMERNMoveOut");
  return res.status(200).json({
    message: "Logged out."
  });
};

exports.logout = logout;

var getCurrentUser = function getCurrentUser(req, res) {
  var users;
  return regeneratorRuntime.async(function getCurrentUser$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.next = 2;
          return regeneratorRuntime.awrap(_User["default"].findById({
            _id: req.user._id
          }));

        case 2:
          users = _context3.sent;

          if (users) {
            _context3.next = 5;
            break;
          }

          return _context3.abrupt("return", res.status(404).json({
            message: "User not found."
          }));

        case 5:
          return _context3.abrupt("return", res.status(200).json(users));

        case 6:
        case "end":
          return _context3.stop();
      }
    }
  });
};

exports.getCurrentUser = getCurrentUser;

var updateCurrentUser = function updateCurrentUser(req, res) {
  var _req$body3, name, email, password, mediaPath, media, mediaType, newMediaPath, err, user, updatedUser;

  return regeneratorRuntime.async(function updateCurrentUser$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _req$body3 = req.body, name = _req$body3.name, email = _req$body3.email, password = _req$body3.password, mediaPath = _req$body3.mediaPath;
          email = email.trim().toLowerCase();
          media = req.file;
          mediaType = undefined, newMediaPath = undefined; // Return the errors if there are any

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
          return regeneratorRuntime.awrap(_User["default"].findById({
            _id: req.user._id
          }));

        case 9:
          user = _context4.sent;

          if (user) {
            _context4.next = 12;
            break;
          }

          return _context4.abrupt("return", res.status(404).json({
            message: "User not found."
          }));

        case 12:
          if (!media) {
            _context4.next = 18;
            break;
          }

          // get the file path
          newMediaPath = "".concat(process.env.UPLOADS_PATH, "/").concat(media.filename); // get the file mediaType

          mediaType = media.mimetype; // if the file mediaType is not an image or an audio file, return an error

          if (!(mediaType !== "image/png" && mediaType !== "image/jpg" && mediaType !== "image/jpeg")) {
            _context4.next = 17;
            break;
          }

          return _context4.abrupt("return", res.status(400).json({
            message: "Valid files are .jpg,.jpeg,.png"
          }));

        case 17:
          mediaType = mediaType.split("/")[0];

        case 18:
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
            _context4.next = 28;
            break;
          }

          _context4.next = 25;
          return regeneratorRuntime.awrap(_bcryptjs["default"].hash(password, 10));

        case 25:
          _context4.t0 = _context4.sent;
          _context4.next = 29;
          break;

        case 28:
          _context4.t0 = user.password;

        case 29:
          user.password = _context4.t0;
          _context4.next = 32;
          return regeneratorRuntime.awrap(user.save());

        case 32:
          updatedUser = _context4.sent;
          (0, _createSetToken["default"])(res, user._id);
          return _context4.abrupt("return", res.status(200).json({
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            mediaPath: updatedUser.mediaPath
          }));

        case 35:
        case "end":
          return _context4.stop();
      }
    }
  });
};

exports.updateCurrentUser = updateCurrentUser;

var deleteCurrentUser = function deleteCurrentUser(req, res) {
  var users;
  return regeneratorRuntime.async(function deleteCurrentUser$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          _context5.next = 2;
          return regeneratorRuntime.awrap(_User["default"].findOne({
            _id: req.user._id
          }));

        case 2:
          users = _context5.sent;

          if (users) {
            _context5.next = 5;
            break;
          }

          return _context5.abrupt("return", res.status(404).json({
            message: "User not found."
          }));

        case 5:
          // remove the media in the uploads folder
          try {
            if (users.mediaPath) {
              _fs["default"].unlinkSync(_path["default"].join(_dirname, users.mediaPath));
            }
          } catch (error) {
            console.log(error);
          } // Delete the user


          _context5.next = 8;
          return regeneratorRuntime.awrap(users.deleteOne());

        case 8:
          return _context5.abrupt("return", res.status(200).json({
            message: "User deleted successfully."
          }));

        case 9:
        case "end":
          return _context5.stop();
      }
    }
  });
};

exports.deleteCurrentUser = deleteCurrentUser;

var verifyEmail = function verifyEmail(req, res) {
  var token, user;
  return regeneratorRuntime.async(function verifyEmail$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          token = req.body.token;

          if (token) {
            _context6.next = 3;
            break;
          }

          return _context6.abrupt("return", res.status(400).json({
            message: "Token is required."
          }));

        case 3:
          _context6.next = 5;
          return regeneratorRuntime.awrap(_User["default"].findOne({
            emailVerificationToken: token,
            emailVerificationTokenExpiresAt: {
              $gt: Date.now()
            }
          }));

        case 5:
          user = _context6.sent;

          if (user) {
            _context6.next = 8;
            break;
          }

          return _context6.abrupt("return", res.status(400).json({
            message: "Invalid token or token expired."
          }));

        case 8:
          // Update the user and set emailVerified to true
          user.emailVerificationToken = undefined;
          user.emailVerificationTokenExpiresAt = undefined;
          user.emailVerified = true;
          _context6.next = 13;
          return regeneratorRuntime.awrap(user.save());

        case 13:
          return _context6.abrupt("return", res.status(200).json({
            message: "Email verified."
          }));

        case 14:
        case "end":
          return _context6.stop();
      }
    }
  });
};

exports.verifyEmail = verifyEmail;

var sendVerificationEmail = function sendVerificationEmail(req, res) {
  var err, email, user, emailToken, emailVerificationToken, emailTemplate;
  return regeneratorRuntime.async(function sendVerificationEmail$(_context7) {
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
          if (!user.emailVerified) {
            _context7.next = 14;
            break;
          }

          return _context7.abrupt("return", res.status(400).json({
            message: "Email already verified."
          }));

        case 14:
          // Create a new email token
          emailToken = _crypto["default"].randomBytes(32).toString("hex");
          emailVerificationToken = _crypto["default"].createHash("sha256").update(emailToken).digest("hex"); // Update the user

          user.emailVerificationToken = emailVerificationToken;
          user.emailVerificationTokenExpiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days

          _context7.next = 20;
          return regeneratorRuntime.awrap(user.save());

        case 20:
          // Get the email template
          emailTemplate = _fs["default"].readFileSync(_path["default"].resolve(".") + "/backend/views/template-email-verification.html", "utf8");
          emailTemplate = emailTemplate.replace("**email_link**", "".concat(process.env.BASE_URL, "/verify-email/").concat(emailVerificationToken));
          emailTemplate = emailTemplate.replace("**name**", user.name); // Send the email

          _context7.next = 25;
          return regeneratorRuntime.awrap(_nodemailer["default"].sendMail({
            from: "\"".concat(process.env.SITE_NAME, "\" <").concat(process.env.SMTP_USER, ">"),
            to: email,
            subject: "Please verify your email.",
            text: "Thank you ".concat(user.name, " for signing up! We're excited to have you on board."),
            html: emailTemplate
          }));

        case 25:
          return _context7.abrupt("return", res.status(200).json({
            message: "Verification sent successfully. Please check your email."
          }));

        case 26:
        case "end":
          return _context7.stop();
      }
    }
  });
};

exports.sendVerificationEmail = sendVerificationEmail;

var sendResetPasswordEmail = function sendResetPasswordEmail(req, res) {
  var err, email, user, emailToken, resetPasswordToken, emailTemplate;
  return regeneratorRuntime.async(function sendResetPasswordEmail$(_context8) {
    while (1) {
      switch (_context8.prev = _context8.next) {
        case 0:
          // Validate the email
          err = (0, _expressValidator.validationResult)(req);

          if (err.isEmpty()) {
            _context8.next = 3;
            break;
          }

          return _context8.abrupt("return", res.status(422).json({
            message: err.array()[0].msg
          }));

        case 3:
          email = req.body.email;
          email = email.trim().toLowerCase();

          if (email) {
            _context8.next = 7;
            break;
          }

          return _context8.abrupt("return", res.status(400).json({
            message: "Email is required."
          }));

        case 7:
          _context8.next = 9;
          return regeneratorRuntime.awrap(_User["default"].findOne({
            email: email
          }));

        case 9:
          user = _context8.sent;

          if (user) {
            _context8.next = 12;
            break;
          }

          return _context8.abrupt("return", res.status(400).json({
            message: "Email not found."
          }));

        case 12:
          // Create a new email token
          emailToken = _crypto["default"].randomBytes(32).toString("hex");
          resetPasswordToken = _crypto["default"].createHash("sha256").update(emailToken).digest("hex"); // Update the user

          user.resetPasswordToken = resetPasswordToken;
          user.resetPasswordTokenExpiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days;

          _context8.next = 18;
          return regeneratorRuntime.awrap(user.save());

        case 18:
          // Get the email template
          emailTemplate = _fs["default"].readFileSync(_path["default"].resolve(".") + "/backend/views/template-email-reset-password.html", "utf8");
          emailTemplate = emailTemplate.replace("**email_link**", "".concat(process.env.BASE_URL, "/reset-password/").concat(resetPasswordToken));
          emailTemplate = emailTemplate.replace("**name**", user.name); // Send the email

          _context8.next = 23;
          return regeneratorRuntime.awrap(_nodemailer["default"].sendMail({
            from: "\"".concat(process.env.SITE_NAME, "\" <").concat(process.env.SMTP_USER, ">"),
            to: email,
            subject: "Resetting your password.",
            text: "Hi ".concat(user.name, "! You can click on the link below to reset your password."),
            html: emailTemplate
          }));

        case 23:
          return _context8.abrupt("return", res.status(200).json({
            message: "Instruction email sent successfully. Please check your email."
          }));

        case 24:
        case "end":
          return _context8.stop();
      }
    }
  });
};

exports.sendResetPasswordEmail = sendResetPasswordEmail;

var verifyTokenResetPassword = function verifyTokenResetPassword(req, res) {
  var token, user;
  return regeneratorRuntime.async(function verifyTokenResetPassword$(_context9) {
    while (1) {
      switch (_context9.prev = _context9.next) {
        case 0:
          token = req.params.token;

          if (token) {
            _context9.next = 3;
            break;
          }

          return _context9.abrupt("return", res.status(400).json({
            message: "Token is required."
          }));

        case 3:
          _context9.next = 5;
          return regeneratorRuntime.awrap(_User["default"].findOne({
            resetPasswordToken: token,
            resetPasswordTokenExpiresAt: {
              $gt: Date.now()
            }
          }));

        case 5:
          user = _context9.sent;

          if (user) {
            _context9.next = 8;
            break;
          }

          return _context9.abrupt("return", res.status(400).json({
            message: "Invalid token or token expired."
          }));

        case 8:
          return _context9.abrupt("return", res.status(200).json({
            message: "Token verified.",
            userId: user._id
          }));

        case 9:
        case "end":
          return _context9.stop();
      }
    }
  });
};

exports.verifyTokenResetPassword = verifyTokenResetPassword;

var updateUserPasswordById = function updateUserPasswordById(req, res) {
  var _req$body4, password, userId, err, user;

  return regeneratorRuntime.async(function updateUserPasswordById$(_context10) {
    while (1) {
      switch (_context10.prev = _context10.next) {
        case 0:
          _req$body4 = req.body, password = _req$body4.password, userId = _req$body4.userId; // Return the errors if there are any

          err = (0, _expressValidator.validationResult)(req);

          if (err.isEmpty()) {
            _context10.next = 4;
            break;
          }

          return _context10.abrupt("return", res.status(422).json({
            message: err.array()[0].msg
          }));

        case 4:
          _context10.next = 6;
          return regeneratorRuntime.awrap(_User["default"].findOne({
            _id: userId
          }));

        case 6:
          user = _context10.sent;

          if (user) {
            _context10.next = 9;
            break;
          }

          return _context10.abrupt("return", res.status(400).json({
            message: "User not found."
          }));

        case 9:
          _context10.next = 11;
          return regeneratorRuntime.awrap(_bcryptjs["default"].hash(password, 10));

        case 11:
          user.password = _context10.sent;
          user.resetPasswordToken = undefined;
          user.resetPasswordTokenExpiresAt = undefined;
          _context10.next = 16;
          return regeneratorRuntime.awrap(user.save());

        case 16:
          return _context10.abrupt("return", res.status(200).json({
            message: "Password has been updated."
          }));

        case 17:
        case "end":
          return _context10.stop();
      }
    }
  });
};

exports.updateUserPasswordById = updateUserPasswordById;
var _default = {
  register: register,
  login: login,
  logout: logout,
  verifyEmail: verifyEmail,
  sendVerificationEmail: sendVerificationEmail,
  getCurrentUser: getCurrentUser,
  updateCurrentUser: updateCurrentUser,
  deleteCurrentUser: deleteCurrentUser,
  sendResetPasswordEmail: sendResetPasswordEmail,
  verifyTokenResetPassword: verifyTokenResetPassword,
  updateUserPasswordById: updateUserPasswordById
};
exports["default"] = _default;