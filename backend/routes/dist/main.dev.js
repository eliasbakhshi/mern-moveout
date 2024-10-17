"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = require("express");

var _main = require("../controllers/main.js");

var _expressAsyncHandler = _interopRequireDefault(require("express-async-handler"));

var _validateToken = _interopRequireDefault(require("../middlewares/validateToken.js"));

var _checkAccess = _interopRequireDefault(require("../middlewares/checkAccess.js"));

var _expressValidator = require("express-validator");

var _multer = _interopRequireDefault(require("../middlewares/multer.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var router = (0, _express.Router)();
router.get("/", (0, _expressAsyncHandler["default"])(_main.home));
router.get("/boxes", _validateToken["default"], (0, _checkAccess["default"])("user"), (0, _expressAsyncHandler["default"])(_main.getBoxes));
router.get("/boxes/:boxId", _validateToken["default"], (0, _checkAccess["default"])("user"), (0, _expressAsyncHandler["default"])(_main.getBox));
router.post("/boxes", _validateToken["default"], (0, _checkAccess["default"])("user"), (0, _expressValidator.body)("name").trim().isString().notEmpty(), (0, _expressValidator.body)("label").trim().isString().notEmpty(), (0, _expressAsyncHandler["default"])(_main.createBox));
router.put("/boxes", _validateToken["default"], (0, _checkAccess["default"])("user"), (0, _expressValidator.body)("name").trim().isString().notEmpty(), (0, _expressValidator.body)("label").trim().isString().notEmpty(), (0, _expressAsyncHandler["default"])(_main.updateBox));
router["delete"]("/boxes/:boxId", _validateToken["default"], (0, _checkAccess["default"])("user"), (0, _expressAsyncHandler["default"])(_main.deleteBox));
router.put("/boxes/status", _validateToken["default"], (0, _checkAccess["default"])("user"), (0, _expressAsyncHandler["default"])(_main.changeBoxStatus)); // Public stuff

router.get("/boxes/:boxId/show", (0, _expressAsyncHandler["default"])(_main.showBoxById));
router.post("/contact", (0, _expressAsyncHandler["default"])(_main.sendContactMessage)); // Items

router.get("/boxes/:boxId/items", (0, _expressAsyncHandler["default"])(_main.getBoxItems));
router.get("/boxes/:boxId/items/:itemId", _validateToken["default"], (0, _checkAccess["default"])("user"), (0, _expressAsyncHandler["default"])(_main.getBoxItem));
router.post("/boxes/items", _validateToken["default"], (0, _checkAccess["default"])("user"), _multer["default"], (0, _expressValidator.body)("description").optional().trim().isString(), (0, _expressValidator.body)("mediaPath").optional().trim().isString(), (0, _expressAsyncHandler["default"])(_main.createItem));
router.put("/boxes/items", _validateToken["default"], (0, _checkAccess["default"])("user"), _multer["default"], (0, _expressValidator.body)("description").optional().trim().isString(), (0, _expressValidator.body)("mediaPath").optional().trim().isString(), (0, _expressAsyncHandler["default"])(_main.updateItem));
router["delete"]("/boxes/items/:itemId", _validateToken["default"], (0, _checkAccess["default"])("user"), (0, _expressAsyncHandler["default"])(_main.deleteItem));
var _default = router;
exports["default"] = _default;