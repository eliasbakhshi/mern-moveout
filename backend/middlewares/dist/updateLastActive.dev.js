"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.updateLastActive = void 0;

var _User = _interopRequireDefault(require("../models/User.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

/* Middleware to Update Last Active Date */
var updateLastActive = function updateLastActive(req, res, next) {
  return regeneratorRuntime.async(function updateLastActive$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          if (!req.user) {
            _context.next = 3;
            break;
          }

          _context.next = 3;
          return regeneratorRuntime.awrap(_User["default"].findByIdAndUpdate(req.user._id, {
            lastActive: Date.now()
          }));

        case 3:
          next();

        case 4:
        case "end":
          return _context.stop();
      }
    }
  });
};

exports.updateLastActive = updateLastActive;
var _default = updateLastActive;
exports["default"] = _default;