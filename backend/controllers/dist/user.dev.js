"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.sendDeleteEmail = exports.reactivateCurrentUser = exports.deactivateCurrentUser = exports.shareLabel = exports.shareBox = exports.getNamesAndEmails = exports.deleteUser = exports.updateCurrentUser = exports.getCurrentUser = exports.updateUserPasswordById = exports.verifyTokenResetPassword = exports.sendResetPasswordEmail = exports.sendVerificationEmail = exports.verifyEmail = exports.logout = exports.loginWithGoogle = exports.login = exports.register = void 0;

var _User = _interopRequireDefault(require("../models/User.js"));

var _bcryptjs = _interopRequireDefault(require("bcryptjs"));

var _expressValidator = require("express-validator");

var _createSetToken = _interopRequireDefault(require("../middlewares/createSetToken.js"));

var _nodemailer = _interopRequireDefault(require("../config/nodemailer.js"));

var _crypto = _interopRequireDefault(require("crypto"));

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _Box = _interopRequireDefault(require("../models/Box.js"));

var _shortUniqueId = _interopRequireDefault(require("short-unique-id"));

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
          emailTemplate = emailTemplate.replace(/(\*\*email_link\*\*)/g, "".concat(process.env.BASE_URL, "/verify-email/").concat(emailVerificationToken));
          emailTemplate = emailTemplate.replace(/(\*\*name\*\*)/g, name);
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

var login = function login(req, res) {
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
            mediaPath: user.mediaPath,
            isActive: user.isActive
          }));

        case 21:
        case "end":
          return _context2.stop();
      }
    }
  });
};

exports.login = login;

var loginWithGoogle = function loginWithGoogle(req, res) {
  var _req$body3, email, name, picture, err, user;

  return regeneratorRuntime.async(function loginWithGoogle$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _req$body3 = req.body, email = _req$body3.email, name = _req$body3.name, picture = _req$body3.picture;
          email = email.trim().toLowerCase();

          if (!(!email || !name)) {
            _context3.next = 4;
            break;
          }

          return _context3.abrupt("return", res.status(400).json({
            message: "Please provide a name and an email"
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
            message: "You need to register first to be able to login with Google."
          }));

        case 12:
          // Verify the user
          user.emailVerified = true;
          user.emailVerificationToken = undefined;
          user.emailVerificationTokenExpiresAt = undefined;
          user.name = user.name || name;
          user.mediaPath = user.mediaPath || picture;
          _context3.next = 19;
          return regeneratorRuntime.awrap(user.save());

        case 19:
          // Create and set a token
          (0, _createSetToken["default"])(res, user._id);
          return _context3.abrupt("return", res.status(200).json({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            mediaPath: user.mediaPath,
            isActive: user.isActive
          }));

        case 21:
        case "end":
          return _context3.stop();
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
  return regeneratorRuntime.async(function verifyEmail$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          token = req.body.token;

          if (token) {
            _context4.next = 3;
            break;
          }

          return _context4.abrupt("return", res.status(400).json({
            message: "Token is required."
          }));

        case 3:
          _context4.next = 5;
          return regeneratorRuntime.awrap(_User["default"].findOne({
            emailVerificationToken: token,
            emailVerificationTokenExpiresAt: {
              $gt: Date.now()
            }
          }));

        case 5:
          user = _context4.sent;

          if (user) {
            _context4.next = 8;
            break;
          }

          return _context4.abrupt("return", res.status(400).json({
            message: "Invalid token or token expired."
          }));

        case 8:
          // Update the user and set emailVerified to true
          user.emailVerificationToken = undefined;
          user.emailVerificationTokenExpiresAt = undefined;
          user.emailVerified = true;
          _context4.next = 13;
          return regeneratorRuntime.awrap(user.save());

        case 13:
          return _context4.abrupt("return", res.status(200).json({
            message: "Email verified."
          }));

        case 14:
        case "end":
          return _context4.stop();
      }
    }
  });
};

exports.verifyEmail = verifyEmail;

var sendVerificationEmail = function sendVerificationEmail(req, res) {
  var err, email, user, emailToken, emailVerificationToken, emailTemplate;
  return regeneratorRuntime.async(function sendVerificationEmail$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          // Validate the email
          err = (0, _expressValidator.validationResult)(req);

          if (err.isEmpty()) {
            _context5.next = 3;
            break;
          }

          return _context5.abrupt("return", res.status(422).json({
            message: err.array()[0].msg
          }));

        case 3:
          email = req.body.email;
          email = email.trim().toLowerCase();

          if (email) {
            _context5.next = 7;
            break;
          }

          return _context5.abrupt("return", res.status(400).json({
            message: "Email is required."
          }));

        case 7:
          _context5.next = 9;
          return regeneratorRuntime.awrap(_User["default"].findOne({
            email: email
          }));

        case 9:
          user = _context5.sent;

          if (user) {
            _context5.next = 12;
            break;
          }

          return _context5.abrupt("return", res.status(400).json({
            message: "Email not found."
          }));

        case 12:
          if (!user.emailVerified) {
            _context5.next = 14;
            break;
          }

          return _context5.abrupt("return", res.status(400).json({
            message: "Email already verified."
          }));

        case 14:
          // Create a new email token
          emailToken = _crypto["default"].randomBytes(32).toString("hex");
          emailVerificationToken = _crypto["default"].createHash("sha256").update(emailToken).digest("hex"); // Update the user

          user.emailVerificationToken = emailVerificationToken;
          user.emailVerificationTokenExpiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days

          _context5.next = 20;
          return regeneratorRuntime.awrap(user.save());

        case 20:
          // Get the email template
          emailTemplate = _fs["default"].readFileSync(_path["default"].resolve(".") + "/backend/views/template-email-verification.html", "utf8");
          emailTemplate = emailTemplate.replace(/(\*\*email_link\*\*)/g, "".concat(process.env.BASE_URL, "/verify-email/").concat(emailVerificationToken));
          emailTemplate = emailTemplate.replace(/(\*\*name\*\*)/g, user.name); // Send the email

          _context5.next = 25;
          return regeneratorRuntime.awrap(_nodemailer["default"].sendMail({
            from: "\"".concat(process.env.SITE_NAME, "\" <").concat(process.env.SMTP_USER, ">"),
            to: email,
            subject: "Please verify your email.",
            text: "Thank you ".concat(user.name, " for signing up! We're excited to have you on board."),
            html: emailTemplate
          }));

        case 25:
          return _context5.abrupt("return", res.status(200).json({
            message: "Verification sent successfully. Please check your email."
          }));

        case 26:
        case "end":
          return _context5.stop();
      }
    }
  });
};

exports.sendVerificationEmail = sendVerificationEmail;

var sendResetPasswordEmail = function sendResetPasswordEmail(req, res) {
  var err, email, user, emailToken, resetPasswordToken, emailTemplate;
  return regeneratorRuntime.async(function sendResetPasswordEmail$(_context6) {
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
          // Create a new email token
          emailToken = _crypto["default"].randomBytes(32).toString("hex");
          resetPasswordToken = _crypto["default"].createHash("sha256").update(emailToken).digest("hex"); // Update the user

          user.resetPasswordToken = resetPasswordToken;
          user.resetPasswordTokenExpiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days;

          _context6.next = 18;
          return regeneratorRuntime.awrap(user.save());

        case 18:
          // Get the email template
          emailTemplate = _fs["default"].readFileSync(_path["default"].resolve(".") + "/backend/views/template-email-reset-password.html", "utf8");
          emailTemplate = emailTemplate.replace(/(\*\*email_link\*\*)/g, "".concat(process.env.BASE_URL, "/reset-password/").concat(resetPasswordToken));
          emailTemplate = emailTemplate.replace(/(\*\*name\*\*)/g, user.name); // Send the email

          _context6.next = 23;
          return regeneratorRuntime.awrap(_nodemailer["default"].sendMail({
            from: "\"".concat(process.env.SITE_NAME, "\" <").concat(process.env.SMTP_USER, ">"),
            to: email,
            subject: "Resetting your password.",
            text: "Hi ".concat(user.name, "! You can click on the link below to reset your password."),
            html: emailTemplate
          }));

        case 23:
          return _context6.abrupt("return", res.status(200).json({
            message: "Instruction email sent successfully. Please check your email."
          }));

        case 24:
        case "end":
          return _context6.stop();
      }
    }
  });
};

exports.sendResetPasswordEmail = sendResetPasswordEmail;

var verifyTokenResetPassword = function verifyTokenResetPassword(req, res) {
  var token, user;
  return regeneratorRuntime.async(function verifyTokenResetPassword$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          token = req.params.token;

          if (token) {
            _context7.next = 3;
            break;
          }

          return _context7.abrupt("return", res.status(400).json({
            message: "Token is required."
          }));

        case 3:
          _context7.next = 5;
          return regeneratorRuntime.awrap(_User["default"].findOne({
            resetPasswordToken: token,
            resetPasswordTokenExpiresAt: {
              $gt: Date.now()
            }
          }));

        case 5:
          user = _context7.sent;

          if (user) {
            _context7.next = 8;
            break;
          }

          return _context7.abrupt("return", res.status(400).json({
            message: "Invalid token or token expired."
          }));

        case 8:
          return _context7.abrupt("return", res.status(200).json({
            message: "Token verified.",
            userId: user._id
          }));

        case 9:
        case "end":
          return _context7.stop();
      }
    }
  });
};

exports.verifyTokenResetPassword = verifyTokenResetPassword;

var updateUserPasswordById = function updateUserPasswordById(req, res) {
  var _req$body4, password, userId, err, user;

  return regeneratorRuntime.async(function updateUserPasswordById$(_context8) {
    while (1) {
      switch (_context8.prev = _context8.next) {
        case 0:
          _req$body4 = req.body, password = _req$body4.password, userId = _req$body4.userId; // Return the errors if there are any

          err = (0, _expressValidator.validationResult)(req);

          if (err.isEmpty()) {
            _context8.next = 4;
            break;
          }

          return _context8.abrupt("return", res.status(422).json({
            message: err.array()[0].msg
          }));

        case 4:
          _context8.next = 6;
          return regeneratorRuntime.awrap(_User["default"].findOne({
            _id: userId
          }));

        case 6:
          user = _context8.sent;

          if (user) {
            _context8.next = 9;
            break;
          }

          return _context8.abrupt("return", res.status(400).json({
            message: "User not found."
          }));

        case 9:
          _context8.next = 11;
          return regeneratorRuntime.awrap(_bcryptjs["default"].hash(password, 10));

        case 11:
          user.password = _context8.sent;
          user.resetPasswordToken = undefined;
          user.resetPasswordTokenExpiresAt = undefined;
          _context8.next = 16;
          return regeneratorRuntime.awrap(user.save());

        case 16:
          return _context8.abrupt("return", res.status(200).json({
            message: "Password has been updated."
          }));

        case 17:
        case "end":
          return _context8.stop();
      }
    }
  });
};

exports.updateUserPasswordById = updateUserPasswordById;

var getCurrentUser = function getCurrentUser(req, res) {
  var users;
  return regeneratorRuntime.async(function getCurrentUser$(_context9) {
    while (1) {
      switch (_context9.prev = _context9.next) {
        case 0:
          _context9.next = 2;
          return regeneratorRuntime.awrap(_User["default"].findById({
            _id: req.user._id
          }));

        case 2:
          users = _context9.sent;

          if (users) {
            _context9.next = 5;
            break;
          }

          return _context9.abrupt("return", res.status(404).json({
            message: "User not found."
          }));

        case 5:
          return _context9.abrupt("return", res.status(200).json(users));

        case 6:
        case "end":
          return _context9.stop();
      }
    }
  });
};

exports.getCurrentUser = getCurrentUser;

var updateCurrentUser = function updateCurrentUser(req, res) {
  var _req$body5, name, email, password, mediaPath, media, mediaType, newMediaPath, err, user, otherUser, updatedUser;

  return regeneratorRuntime.async(function updateCurrentUser$(_context10) {
    while (1) {
      switch (_context10.prev = _context10.next) {
        case 0:
          _req$body5 = req.body, name = _req$body5.name, email = _req$body5.email, password = _req$body5.password, mediaPath = _req$body5.mediaPath;
          email = email.trim().toLowerCase();
          media = req.file;
          mediaType = undefined, newMediaPath = undefined; // Return the errors if there are any

          err = (0, _expressValidator.validationResult)(req);

          if (err.isEmpty()) {
            _context10.next = 7;
            break;
          }

          return _context10.abrupt("return", res.status(422).json({
            message: err.array()[0].msg
          }));

        case 7:
          _context10.next = 9;
          return regeneratorRuntime.awrap(_User["default"].findById({
            _id: req.user._id
          }));

        case 9:
          user = _context10.sent;

          if (user) {
            _context10.next = 12;
            break;
          }

          return _context10.abrupt("return", res.status(404).json({
            message: "User not found."
          }));

        case 12:
          _context10.next = 14;
          return regeneratorRuntime.awrap(_User["default"].findOne({
            _id: {
              $ne: req.user._id
            },
            email: email
          }));

        case 14:
          otherUser = _context10.sent;

          if (!otherUser) {
            _context10.next = 17;
            break;
          }

          return _context10.abrupt("return", res.status(400).json({
            message: "Email already exists."
          }));

        case 17:
          if (!media) {
            _context10.next = 23;
            break;
          }

          // get the file path
          newMediaPath = "".concat(process.env.UPLOADS_PATH, "/").concat(media.filename); // get the file mediaType

          mediaType = media.mimetype; // if the file mediaType is not an image or an audio file, return an error

          if (!(mediaType !== "image/png" && mediaType !== "image/jpg" && mediaType !== "image/jpeg")) {
            _context10.next = 22;
            break;
          }

          return _context10.abrupt("return", res.status(400).json({
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
            _context10.next = 33;
            break;
          }

          _context10.next = 30;
          return regeneratorRuntime.awrap(_bcryptjs["default"].hash(password, 10));

        case 30:
          _context10.t0 = _context10.sent;
          _context10.next = 34;
          break;

        case 33:
          _context10.t0 = user.password;

        case 34:
          user.password = _context10.t0;
          _context10.next = 37;
          return regeneratorRuntime.awrap(user.save());

        case 37:
          updatedUser = _context10.sent;
          (0, _createSetToken["default"])(res, user._id);
          return _context10.abrupt("return", res.status(200).json({
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            mediaPath: updatedUser.mediaPath,
            isActive: user.isActive
          }));

        case 40:
        case "end":
          return _context10.stop();
      }
    }
  });
};

exports.updateCurrentUser = updateCurrentUser;

var deleteUser = function deleteUser(req, res) {
  var token, users;
  return regeneratorRuntime.async(function deleteUser$(_context11) {
    while (1) {
      switch (_context11.prev = _context11.next) {
        case 0:
          token = req.query.token; // Find the user

          _context11.next = 3;
          return regeneratorRuntime.awrap(_User["default"].findOne({
            _id: req.user._id,
            emailDeleteToken: token,
            emailDeleteTokenExpiresAt: {
              $gt: Date.now()
            }
          }));

        case 3:
          users = _context11.sent;

          if (users) {
            _context11.next = 6;
            break;
          }

          return _context11.abrupt("return", res.status(404).json({
            message: "User not found."
          }));

        case 6:
          // remove the media in the uploads folder
          try {
            if (users.mediaPath) {
              _fs["default"].unlinkSync(_path["default"].join(_dirname, users.mediaPath));
            }
          } catch (error) {
            console.log(error);
          } // Delete the user


          _context11.next = 9;
          return regeneratorRuntime.awrap(users.deleteOne());

        case 9:
          // Clear the cookie
          res.clearCookie("JWTMERNMoveOut");
          return _context11.abrupt("return", res.status(200).json({
            message: "Your account has been successfully deleted. We're sorry to see you go."
          }));

        case 11:
        case "end":
          return _context11.stop();
      }
    }
  });
};

exports.deleteUser = deleteUser;

var getNamesAndEmails = function getNamesAndEmails(req, res) {
  var users;
  return regeneratorRuntime.async(function getNamesAndEmails$(_context12) {
    while (1) {
      switch (_context12.prev = _context12.next) {
        case 0:
          _context12.next = 2;
          return regeneratorRuntime.awrap(_User["default"].find({
            email: {
              $ne: req.user.email
            }
          }, {
            email: 1,
            name: 1,
            _id: 0
          }));

        case 2:
          users = _context12.sent;

          if (users) {
            _context12.next = 5;
            break;
          }

          return _context12.abrupt("return", res.status(404).json({
            message: "No email and name exists"
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

exports.getNamesAndEmails = getNamesAndEmails;

var shareBox = function shareBox(req, res) {
  var _req$body6, boxId, email, uid, err, user, box, newBox, emailTemplate;

  return regeneratorRuntime.async(function shareBox$(_context13) {
    while (1) {
      switch (_context13.prev = _context13.next) {
        case 0:
          _req$body6 = req.body, boxId = _req$body6.boxId, email = _req$body6.email;
          uid = new _shortUniqueId["default"]({
            length: 6,
            dictionary: "number"
          }); // show the error if there is any

          if (!(!boxId || !email)) {
            _context13.next = 4;
            break;
          }

          return _context13.abrupt("return", res.status(400).json({
            message: "Box ID and email are required."
          }));

        case 4:
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
          return regeneratorRuntime.awrap(_User["default"].findOne({
            email: email
          }));

        case 9:
          user = _context13.sent;

          if (user) {
            _context13.next = 12;
            break;
          }

          return _context13.abrupt("return", res.status(400).json({
            message: "User not found."
          }));

        case 12:
          _context13.next = 14;
          return regeneratorRuntime.awrap(_Box["default"].findOne({
            _id: boxId
          }));

        case 14:
          box = _context13.sent;

          if (box) {
            _context13.next = 17;
            break;
          }

          return _context13.abrupt("return", res.status(400).json({
            message: "Box not found."
          }));

        case 17:
          _context13.next = 19;
          return regeneratorRuntime.awrap(_Box["default"].create({
            name: box.name,
            description: box.description,
            items: box.items,
            labelNum: box.labelNum,
            isPrivate: box.isPrivate,
            privateCode: box.privateCode ? uid.randomUUID(6) : undefined,
            user: user._id
          }));

        case 19:
          newBox = _context13.sent;
          // Add the box to the user's box list
          user.boxes.push(newBox._id);
          _context13.next = 23;
          return regeneratorRuntime.awrap(user.save());

        case 23:
          // Get the email template for sharing a box
          emailTemplate = _fs["default"].readFileSync(_path["default"].resolve(".") + "/backend/views/template-share-box-or-label.html", "utf8");
          emailTemplate = emailTemplate.replace(/(\*\*email_link\*\*)/g, "".concat(process.env.BASE_URL, "/boxes/").concat(newBox._id, "/items"));
          emailTemplate = emailTemplate.replace(/(\*\*name_from\*\*)/g, req.user.name);
          emailTemplate = emailTemplate.replace(/(\*\*name_to\*\*)/g, user.name);
          emailTemplate = emailTemplate.replace(/(\*\*shared_object\*\*)/g, "box");
          _context13.prev = 28;
          _context13.next = 31;
          return regeneratorRuntime.awrap(_nodemailer["default"].sendMail({
            from: "\"".concat(process.env.SITE_NAME, "\" <").concat(process.env.SMTP_USER, ">"),
            to: email,
            subject: "A box has been shared with you.",
            text: "".concat(user.name, " has shared a box with you. You can click on the link below to view the box."),
            html: emailTemplate
          }));

        case 31:
          _context13.next = 36;
          break;

        case 33:
          _context13.prev = 33;
          _context13.t0 = _context13["catch"](28);
          return _context13.abrupt("return", res.status(500).json({
            message: "Email address rejected because domain not found."
          }));

        case 36:
          return _context13.abrupt("return", res.status(200).json({
            message: "Box shared successfully."
          }));

        case 37:
        case "end":
          return _context13.stop();
      }
    }
  }, null, null, [[28, 33]]);
};

exports.shareBox = shareBox;

var shareLabel = function shareLabel(req, res) {
  var _req$body7, labelId, email, uid, err, user, emailTemplate;

  return regeneratorRuntime.async(function shareLabel$(_context14) {
    while (1) {
      switch (_context14.prev = _context14.next) {
        case 0:
          _req$body7 = req.body, labelId = _req$body7.labelId, email = _req$body7.email;
          uid = new _shortUniqueId["default"]({
            length: 6,
            dictionary: "number"
          }); // show the error if there is any

          if (!(!labelId || !email)) {
            _context14.next = 4;
            break;
          }

          return _context14.abrupt("return", res.status(400).json({
            message: "Box ID and email are required."
          }));

        case 4:
          err = (0, _expressValidator.validationResult)(req);

          if (err.isEmpty()) {
            _context14.next = 7;
            break;
          }

          return _context14.abrupt("return", res.status(422).json({
            message: err.array()[0].msg
          }));

        case 7:
          _context14.next = 9;
          return regeneratorRuntime.awrap(_User["default"].findOne({
            email: email
          }, {
            name: 1
          }));

        case 9:
          user = _context14.sent;

          if (user) {
            _context14.next = 12;
            break;
          }

          return _context14.abrupt("return", res.status(400).json({
            message: "User not found."
          }));

        case 12:
          // Get the email template for sharing a box
          emailTemplate = _fs["default"].readFileSync(_path["default"].resolve(".") + "/backend/views/template-share-box-or-label.html", "utf8");
          emailTemplate = emailTemplate.replace(/(\*\*email_link\*\*)/g, "".concat(process.env.BASE_URL, "/boxes/").concat(labelId));
          emailTemplate = emailTemplate.replace(/(\*\*name_from\*\*)/g, req.user.name);
          emailTemplate = emailTemplate.replace(/(\*\*name_to\*\*)/g, user.name);
          emailTemplate = emailTemplate.replace(/(\*\*shared_object\*\*)/g, "label");
          _context14.prev = 17;
          _context14.next = 20;
          return regeneratorRuntime.awrap(_nodemailer["default"].sendMail({
            from: "\"".concat(process.env.SITE_NAME, "\" <").concat(process.env.SMTP_USER, ">"),
            to: email,
            subject: "A label has been shared with you.",
            text: "".concat(user.name, " has shared a label with you. You can click on the link below to view the label."),
            html: emailTemplate
          }));

        case 20:
          _context14.next = 25;
          break;

        case 22:
          _context14.prev = 22;
          _context14.t0 = _context14["catch"](17);
          return _context14.abrupt("return", res.status(500).json({
            message: "Email address rejected because domain not found."
          }));

        case 25:
          return _context14.abrupt("return", res.status(200).json({
            message: "Label shared successfully."
          }));

        case 26:
        case "end":
          return _context14.stop();
      }
    }
  }, null, null, [[17, 22]]);
};

exports.shareLabel = shareLabel;

var deactivateCurrentUser = function deactivateCurrentUser(req, res) {
  var user, emailTemplate, name, email, role, isActive, mediaPath;
  return regeneratorRuntime.async(function deactivateCurrentUser$(_context15) {
    while (1) {
      switch (_context15.prev = _context15.next) {
        case 0:
          _context15.next = 2;
          return regeneratorRuntime.awrap(_User["default"].findOne({
            _id: req.user._id
          }));

        case 2:
          user = _context15.sent;

          if (user) {
            _context15.next = 5;
            break;
          }

          return _context15.abrupt("return", res.status(404).json({
            message: "User not found."
          }));

        case 5:
          // Deactivate the user
          user.isActive = false;
          _context15.next = 8;
          return regeneratorRuntime.awrap(user.save());

        case 8:
          // Get the email template
          emailTemplate = _fs["default"].readFileSync(_path["default"].resolve(".") + "/backend/views/template-deactive-reactive-user.html", "utf8");
          emailTemplate = emailTemplate.replace(/(\*\*login_link\*\*)/g, "".concat(process.env.BASE_URL, "/login"));
          emailTemplate = emailTemplate.replace(/(\*\*name\*\*)/g, user.name);
          _context15.prev = 11;
          _context15.next = 14;
          return regeneratorRuntime.awrap(_nodemailer["default"].sendMail({
            from: "\"".concat(process.env.SITE_NAME, "\" <").concat(process.env.SMTP_USER, ">"),
            to: user.email,
            subject: "Your account has been deactivated.",
            html: emailTemplate
          }));

        case 14:
          _context15.next = 19;
          break;

        case 16:
          _context15.prev = 16;
          _context15.t0 = _context15["catch"](11);
          return _context15.abrupt("return", res.status(500).json({
            message: "Email address rejected because domain not found."
          }));

        case 19:
          name = user.name, email = user.email, role = user.role, isActive = user.isActive, mediaPath = user.mediaPath;
          return _context15.abrupt("return", res.status(200).json({
            message: "User deactivated successfully.",
            user: {
              name: name,
              email: email,
              role: role,
              isActive: isActive,
              mediaPath: mediaPath
            }
          }));

        case 21:
        case "end":
          return _context15.stop();
      }
    }
  }, null, null, [[11, 16]]);
};

exports.deactivateCurrentUser = deactivateCurrentUser;

var reactivateCurrentUser = function reactivateCurrentUser(req, res) {
  var user, name, email, role, isActive, mediaPath;
  return regeneratorRuntime.async(function reactivateCurrentUser$(_context16) {
    while (1) {
      switch (_context16.prev = _context16.next) {
        case 0:
          _context16.next = 2;
          return regeneratorRuntime.awrap(_User["default"].findOne({
            _id: req.user._id
          }));

        case 2:
          user = _context16.sent;

          if (user) {
            _context16.next = 5;
            break;
          }

          return _context16.abrupt("return", res.status(404).json({
            message: "User not found."
          }));

        case 5:
          // Deactivate the user
          user.isActive = true;
          _context16.next = 8;
          return regeneratorRuntime.awrap(user.save());

        case 8:
          name = user.name, email = user.email, role = user.role, isActive = user.isActive, mediaPath = user.mediaPath;
          return _context16.abrupt("return", res.status(200).json({
            message: "User reactivated successfully.",
            user: {
              name: name,
              email: email,
              role: role,
              isActive: isActive,
              mediaPath: mediaPath
            }
          }));

        case 10:
        case "end":
          return _context16.stop();
      }
    }
  });
};

exports.reactivateCurrentUser = reactivateCurrentUser;

var sendDeleteEmail = function sendDeleteEmail(req, res) {
  var user, emailToken, emailDeleteToken, emailDeleteTokenExpiresAt, emailTemplate, name, email, role, isActive, mediaPath;
  return regeneratorRuntime.async(function sendDeleteEmail$(_context17) {
    while (1) {
      switch (_context17.prev = _context17.next) {
        case 0:
          _context17.next = 2;
          return regeneratorRuntime.awrap(_User["default"].findOne({
            _id: req.user._id
          }));

        case 2:
          user = _context17.sent;

          if (user) {
            _context17.next = 5;
            break;
          }

          return _context17.abrupt("return", res.status(404).json({
            message: "User not found."
          }));

        case 5:
          emailToken = _crypto["default"].randomBytes(32).toString("hex");
          emailDeleteToken = _crypto["default"].createHash("sha256").update(emailToken).digest("hex");
          emailDeleteTokenExpiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days
          // update the user

          user.emailDeleteToken = emailDeleteToken;
          user.emailDeleteTokenExpiresAt = emailDeleteTokenExpiresAt;
          _context17.next = 12;
          return regeneratorRuntime.awrap(user.save());

        case 12:
          // Get the email template
          emailTemplate = _fs["default"].readFileSync(_path["default"].resolve(".") + "/backend/views/template-email-delete-user.html", "utf8");
          emailTemplate = emailTemplate.replace(/(\*\*delete_link\*\*)/g, "".concat(process.env.BASE_URL, "/delete-account/").concat(emailDeleteToken));
          emailTemplate = emailTemplate.replace(/(\*\*name\*\*)/g, user.name);
          _context17.prev = 15;
          _context17.next = 18;
          return regeneratorRuntime.awrap(_nodemailer["default"].sendMail({
            from: "\"".concat(process.env.SITE_NAME, "\" <").concat(process.env.SMTP_USER, ">"),
            to: user.email,
            subject: "Verify Your Account Deletion Request",
            html: emailTemplate
          }));

        case 18:
          _context17.next = 23;
          break;

        case 20:
          _context17.prev = 20;
          _context17.t0 = _context17["catch"](15);
          return _context17.abrupt("return", res.status(500).json({
            message: "Email address rejected because domain not found."
          }));

        case 23:
          name = user.name, email = user.email, role = user.role, isActive = user.isActive, mediaPath = user.mediaPath;
          return _context17.abrupt("return", res.status(200).json({
            message: "Delete confirmation email sent successfully.",
            user: {
              name: name,
              email: email,
              role: role,
              isActive: isActive,
              mediaPath: mediaPath
            }
          }));

        case 25:
        case "end":
          return _context17.stop();
      }
    }
  }, null, null, [[15, 20]]);
};

exports.sendDeleteEmail = sendDeleteEmail;
var _default = {
  register: register,
  login: login,
  loginWithGoogle: loginWithGoogle,
  logout: logout,
  verifyEmail: verifyEmail,
  sendVerificationEmail: sendVerificationEmail,
  sendResetPasswordEmail: sendResetPasswordEmail,
  verifyTokenResetPassword: verifyTokenResetPassword,
  updateUserPasswordById: updateUserPasswordById,
  getCurrentUser: getCurrentUser,
  updateCurrentUser: updateCurrentUser,
  deleteUser: deleteUser,
  getNamesAndEmails: getNamesAndEmails,
  shareBox: shareBox,
  shareLabel: shareLabel,
  deactivateCurrentUser: deactivateCurrentUser,
  reactivateCurrentUser: reactivateCurrentUser,
  sendDeleteEmail: sendDeleteEmail
};
exports["default"] = _default;