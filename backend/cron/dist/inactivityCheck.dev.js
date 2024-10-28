"use strict";

var _nodeCron = _interopRequireDefault(require("node-cron"));

var _User = _interopRequireDefault(require("../models/User"));

var _nodemailer = _interopRequireDefault(require("../config/nodemailer"));

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

// Cron Job for Inactivity Check
_nodeCron["default"].schedule("0 0 * * *", function _callee() {
  var oneMonthAgo, threeWeeksAgo, usersToDeactivate, usersToRemind, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, user, emailTemplate, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, _user, _emailTemplate;

  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          oneMonthAgo = new Date();
          oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
          threeWeeksAgo = new Date();
          threeWeeksAgo.setDate(threeWeeksAgo.getDate() - 21);
          _context.next = 6;
          return regeneratorRuntime.awrap(_User["default"].find({
            lastActive: {
              $lt: oneMonthAgo
            },
            isActive: true
          }));

        case 6:
          usersToDeactivate = _context.sent;
          _context.next = 9;
          return regeneratorRuntime.awrap(_User["default"].find({
            lastActive: {
              $lt: threeWeeksAgo,
              $gte: oneMonthAgo
            },
            isActive: true,
            reminderSent: false
          }));

        case 9:
          usersToRemind = _context.sent;
          // Send email to users who need to be reminded
          _iteratorNormalCompletion = true;
          _didIteratorError = false;
          _iteratorError = undefined;
          _context.prev = 13;
          _iterator = usersToRemind[Symbol.iterator]();

        case 15:
          if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
            _context.next = 35;
            break;
          }

          user = _step.value;
          // Get the email template
          emailTemplate = _fs["default"].readFileSync(_path["default"].resolve(".") + "/backend/views/template-reminder-inactivity.html", "utf8");
          emailTemplate = emailTemplate.replace(/(\*\*login_link\*\*)/g, "".concat(process.env.BASE_URL, "/login"));
          emailTemplate = emailTemplate.replace(/(\*\*name\*\*)/g, user.name);
          _context.prev = 20;
          _context.next = 23;
          return regeneratorRuntime.awrap(_nodemailer["default"].sendMail({
            from: "\"".concat(process.env.SITE_NAME, "\" <").concat(process.env.SMTP_USER, ">"),
            to: user.email,
            subject: "Reminder: Your account will be deactivated soon.",
            html: emailTemplate
          }));

        case 23:
          user.reminderSent = true;
          _context.next = 26;
          return regeneratorRuntime.awrap(user.save());

        case 26:
          _context.next = 32;
          break;

        case 28:
          _context.prev = 28;
          _context.t0 = _context["catch"](20);
          console.error("Failed to send email:", _context.t0);
          return _context.abrupt("continue", 32);

        case 32:
          _iteratorNormalCompletion = true;
          _context.next = 15;
          break;

        case 35:
          _context.next = 41;
          break;

        case 37:
          _context.prev = 37;
          _context.t1 = _context["catch"](13);
          _didIteratorError = true;
          _iteratorError = _context.t1;

        case 41:
          _context.prev = 41;
          _context.prev = 42;

          if (!_iteratorNormalCompletion && _iterator["return"] != null) {
            _iterator["return"]();
          }

        case 44:
          _context.prev = 44;

          if (!_didIteratorError) {
            _context.next = 47;
            break;
          }

          throw _iteratorError;

        case 47:
          return _context.finish(44);

        case 48:
          return _context.finish(41);

        case 49:
          // Deactivate users who have been inactive for more than a month and send them an email
          _iteratorNormalCompletion2 = true;
          _didIteratorError2 = false;
          _iteratorError2 = undefined;
          _context.prev = 52;
          _iterator2 = usersToDeactivate[Symbol.iterator]();

        case 54:
          if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
            _context.next = 74;
            break;
          }

          _user = _step2.value;
          // Get the email template
          _emailTemplate = _fs["default"].readFileSync(_path["default"].resolve(".") + "/backend/views/template-deactivate-inactivity.html", "utf8");
          _emailTemplate = _emailTemplate.replace(/(\*\*login_link\*\*)/g, "".concat(process.env.BASE_URL, "/login"));
          _emailTemplate = _emailTemplate.replace(/(\*\*name\*\*)/g, _user.name);
          _context.prev = 59;
          _context.next = 62;
          return regeneratorRuntime.awrap(_nodemailer["default"].sendMail({
            from: "\"".concat(process.env.SITE_NAME, "\" <").concat(process.env.SMTP_USER, ">"),
            to: _user.email,
            subject: "Your account has been deactivated.",
            html: _emailTemplate
          }));

        case 62:
          _user.isActive = false;
          _context.next = 65;
          return regeneratorRuntime.awrap(_user.save());

        case 65:
          _context.next = 71;
          break;

        case 67:
          _context.prev = 67;
          _context.t2 = _context["catch"](59);
          console.error("Failed to send email:", _context.t2);
          return _context.abrupt("continue", 71);

        case 71:
          _iteratorNormalCompletion2 = true;
          _context.next = 54;
          break;

        case 74:
          _context.next = 80;
          break;

        case 76:
          _context.prev = 76;
          _context.t3 = _context["catch"](52);
          _didIteratorError2 = true;
          _iteratorError2 = _context.t3;

        case 80:
          _context.prev = 80;
          _context.prev = 81;

          if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
            _iterator2["return"]();
          }

        case 83:
          _context.prev = 83;

          if (!_didIteratorError2) {
            _context.next = 86;
            break;
          }

          throw _iteratorError2;

        case 86:
          return _context.finish(83);

        case 87:
          return _context.finish(80);

        case 88:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[13, 37, 41, 49], [20, 28], [42,, 44, 48], [52, 76, 80, 88], [59, 67], [81,, 83, 87]]);
});