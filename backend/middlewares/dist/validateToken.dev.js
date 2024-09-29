"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _jsonwebtoken = _interopRequireDefault(require("jsonwebtoken"));

var _User = _interopRequireDefault(require("../models/User.js"));

var _expressAsyncHandler = _interopRequireDefault(require("express-async-handler"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var validateToken = (0, _expressAsyncHandler["default"])(function _callee(req, res, next) {
  var token, decoded;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          token = req.cookies.JWTMERNMoveOut;

          if (token) {
            _context.next = 3;
            break;
          }

          return _context.abrupt("return", res.status(401).json({
            message: "You need to be logged in to access this route"
          }));

        case 3:
          decoded = _jsonwebtoken["default"].verify(token, process.env.JWT_KEY);

          if (decoded) {
            _context.next = 6;
            break;
          }

          return _context.abrupt("return", res.status(401).json({
            message: "Invalid token"
          }));

        case 6:
          _context.next = 8;
          return regeneratorRuntime.awrap(_User["default"].findById(decoded.id));

        case 8:
          req.user = _context.sent;
          next();

        case 10:
        case "end":
          return _context.stop();
      }
    }
  });
});
var _default = validateToken;
exports["default"] = _default;