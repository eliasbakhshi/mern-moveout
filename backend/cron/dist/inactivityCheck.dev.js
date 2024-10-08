"use strict";

var _nodeCron = _interopRequireDefault(require("node-cron"));

var _User = _interopRequireDefault(require("../models/User"));

var _nodemailer = _interopRequireDefault(require("../config/nodemailer"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

// Cron Job for Inactivity Check
_nodeCron["default"].schedule("0 0 * * *", function _callee() {
  var oneMonthAgo, usersToDeactivate, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, user, emailTemplate;

  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          oneMonthAgo = new Date();
          oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
          _context.next = 4;
          return regeneratorRuntime.awrap(_User["default"].find({
            lastActive: {
              $lt: oneMonthAgo
            },
            isActive: true
          }));

        case 4:
          usersToDeactivate = _context.sent;

          if (!(usersToDeactivate.length === 0)) {
            _context.next = 7;
            break;
          }

          return _context.abrupt("return");

        case 7:
          _iteratorNormalCompletion = true;
          _didIteratorError = false;
          _iteratorError = undefined;
          _context.prev = 10;
          _iterator = usersToDeactivate[Symbol.iterator]();

        case 12:
          if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
            _context.next = 37;
            break;
          }

          user = _step.value;
          // Get the email template
          emailTemplate = fs.readFileSync(path.resolve(".") + "/backend/views/template-reminder-inactivity.html", "utf8");
          emailTemplate = emailTemplate.replace(/(\*\*login_link\*\*)/g, "".concat(process.env.BASE_URL, "/login"));
          emailTemplate = emailTemplate.replace(/(\*\*name\*\*)/g, user.name);
          _context.prev = 17;
          _context.next = 20;
          return regeneratorRuntime.awrap(_nodemailer["default"].sendMail({
            from: "\"".concat(process.env.SITE_NAME, "\" <").concat(process.env.SMTP_USER, ">"),
            to: email,
            subject: "Reminder: Your account will be deactivated soon.",
            html: emailTemplate
          }));

        case 20:
          _context.next = 25;
          break;

        case 22:
          _context.prev = 22;
          _context.t0 = _context["catch"](17);
          return _context.abrupt("return", res.status(500).json({
            message: "Email address rejected because domain not found."
          }));

        case 25:
          if (!user.reminderSent) {
            _context.next = 31;
            break;
          }

          user.isActive = false;
          _context.next = 29;
          return regeneratorRuntime.awrap(user.save());

        case 29:
          _context.next = 34;
          break;

        case 31:
          user.reminderSent = true;
          _context.next = 34;
          return regeneratorRuntime.awrap(user.save());

        case 34:
          _iteratorNormalCompletion = true;
          _context.next = 12;
          break;

        case 37:
          _context.next = 43;
          break;

        case 39:
          _context.prev = 39;
          _context.t1 = _context["catch"](10);
          _didIteratorError = true;
          _iteratorError = _context.t1;

        case 43:
          _context.prev = 43;
          _context.prev = 44;

          if (!_iteratorNormalCompletion && _iterator["return"] != null) {
            _iterator["return"]();
          }

        case 46:
          _context.prev = 46;

          if (!_didIteratorError) {
            _context.next = 49;
            break;
          }

          throw _iteratorError;

        case 49:
          return _context.finish(46);

        case 50:
          return _context.finish(43);

        case 51:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[10, 39, 43, 51], [17, 22], [44,, 46, 50]]);
});