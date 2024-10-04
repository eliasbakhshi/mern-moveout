"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.deleteItem = exports.updateItem = exports.createItem = exports.getBoxItem = exports.getBoxItems = exports.sendContactMessage = exports.showBoxById = exports.deleteBox = exports.updateBox = exports.createBox = exports.getBox = exports.getBoxes = exports.home = void 0;

var _Box = _interopRequireDefault(require("../models/Box.js"));

var _expressValidator = require("express-validator");

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _nodemailer = _interopRequireDefault(require("../config/nodemailer.js"));

var _shortUniqueId = _interopRequireDefault(require("short-unique-id"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var uid = new _shortUniqueId["default"]({
  length: 6,
  dictionary: "number"
});

var _dirname = _path["default"].resolve();

var home = function home(req, res) {
  return res.status(200).json({
    message: "Welcome to the Move out API"
  });
};

exports.home = home;

var getBoxes = function getBoxes(req, res) {
  var boxes, sortedItems;
  return regeneratorRuntime.async(function getBoxes$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return regeneratorRuntime.awrap(_Box["default"].find({
            user: req.user._id
          }).sort({
            createdAt: 1
          }));

        case 2:
          boxes = _context.sent;

          if (boxes) {
            _context.next = 5;
            break;
          }

          return _context.abrupt("return", res.status(400).json({
            message: "No box found."
          }));

        case 5:
          sortedItems = boxes.sort(function (a, b) {
            return b.createdAt - a.createdAt;
          });
          return _context.abrupt("return", res.status(200).json({
            boxes: sortedItems
          }));

        case 7:
        case "end":
          return _context.stop();
      }
    }
  });
};

exports.getBoxes = getBoxes;

var getBox = function getBox(req, res) {
  var boxId, query, box, sortedItems;
  return regeneratorRuntime.async(function getBox$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          boxId = req.params.boxId;
          query = {
            _id: boxId
          };
          if (req.user.role !== "admin") query = _objectSpread({}, query, {
            user: req.user._id
          });
          _context2.next = 5;
          return regeneratorRuntime.awrap(_Box["default"].findOne(query));

        case 5:
          box = _context2.sent;

          if (box) {
            _context2.next = 8;
            break;
          }

          return _context2.abrupt("return", res.status(400).json({
            message: "No box found."
          }));

        case 8:
          sortedItems = box.items.sort(function (a, b) {
            return b.createdAt - a.createdAt;
          });
          box.items = sortedItems;
          return _context2.abrupt("return", res.status(200).json(_objectSpread({}, box._doc)));

        case 11:
        case "end":
          return _context2.stop();
      }
    }
  });
};

exports.getBox = getBox;

var createBox = function createBox(req, res) {
  var _req$body, name, labelNum, isPrivate, privateCode, box, newBox;

  return regeneratorRuntime.async(function createBox$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _req$body = req.body, name = _req$body.name, labelNum = _req$body.labelNum, isPrivate = _req$body.isPrivate;
          privateCode = uid.randomUUID(6);

          if (!(!name || !labelNum || isPrivate === undefined)) {
            _context3.next = 4;
            break;
          }

          return _context3.abrupt("return", res.status(400).json({
            message: "Please provide a name and a label"
          }));

        case 4:
          box = new _Box["default"]({
            name: name,
            labelNum: labelNum,
            user: req.user._id,
            isPrivate: isPrivate,
            privateCode: isPrivate ? privateCode : undefined
          });
          _context3.next = 7;
          return regeneratorRuntime.awrap(box.save());

        case 7:
          newBox = _context3.sent;
          // Add new box to the user's boxes
          req.user.boxes.push(newBox._id);
          _context3.next = 11;
          return regeneratorRuntime.awrap(req.user.save());

        case 11:
          return _context3.abrupt("return", res.status(201).json({
            id: newBox._id,
            message: "Box created."
          }));

        case 12:
        case "end":
          return _context3.stop();
      }
    }
  });
};

exports.createBox = createBox;

var updateBox = function updateBox(req, res) {
  var _req$body2, name, labelNum, boxId, isPrivate, box;

  return regeneratorRuntime.async(function updateBox$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _req$body2 = req.body, name = _req$body2.name, labelNum = _req$body2.labelNum, boxId = _req$body2.boxId, isPrivate = _req$body2.isPrivate;
          console.log(req.body);

          if (!(!name || !labelNum || !boxId || isPrivate === undefined)) {
            _context4.next = 4;
            break;
          }

          return _context4.abrupt("return", res.status(400).json({
            message: "Please provide a name, a label, and a box ID"
          }));

        case 4:
          _context4.next = 6;
          return regeneratorRuntime.awrap(_Box["default"].findOne({
            user: req.user._id,
            _id: boxId
          }));

        case 6:
          box = _context4.sent;

          if (box) {
            _context4.next = 9;
            break;
          }

          return _context4.abrupt("return", res.status(400).json({
            message: "Box not found"
          }));

        case 9:
          box.name = name;
          box.labelNum = labelNum;
          box.isPrivate = isPrivate;
          box.privateCode = isPrivate == "true" ? uid.randomUUID(6) : undefined; // if (isPrivate) {
          //   // if the box is private, generate a private code with old code if there is one
          //   box.privateCode = box.privateCode || uid.randomUUID(6);
          // }

          _context4.next = 15;
          return regeneratorRuntime.awrap(box.save());

        case 15:
          return _context4.abrupt("return", res.status(200).json({
            message: "Box updated successfully."
          }));

        case 16:
        case "end":
          return _context4.stop();
      }
    }
  });
};

exports.updateBox = updateBox;

var deleteBox = function deleteBox(req, res) {
  var boxId, box;
  return regeneratorRuntime.async(function deleteBox$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          boxId = req.params.boxId;

          if (boxId) {
            _context5.next = 3;
            break;
          }

          return _context5.abrupt("return", res.status(400).json({
            message: "Please provide an box ID"
          }));

        case 3:
          _context5.next = 5;
          return regeneratorRuntime.awrap(_Box["default"].findOneAndDelete({
            user: req.user._id,
            _id: boxId
          }));

        case 5:
          box = _context5.sent;

          if (box) {
            _context5.next = 8;
            break;
          }

          return _context5.abrupt("return", res.status(400).json({
            message: "Box not found"
          }));

        case 8:
          // Remove the box from the user's boxes
          req.user.boxes = req.user.boxes.filter(function (boxId) {
            return boxId.toString() !== box._id.toString();
          });
          _context5.next = 11;
          return regeneratorRuntime.awrap(req.user.save());

        case 11:
          return _context5.abrupt("return", res.status(200).json({
            message: "Box deleted successfully."
          }));

        case 12:
        case "end":
          return _context5.stop();
      }
    }
  });
}; // Public stuff


exports.deleteBox = deleteBox;

var showBoxById = function showBoxById(req, res) {
  var boxId, box, sortedItems;
  return regeneratorRuntime.async(function showBoxById$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          boxId = req.params.boxId;
          _context6.next = 3;
          return regeneratorRuntime.awrap(_Box["default"].findOne({
            _id: boxId
          }));

        case 3:
          box = _context6.sent;

          if (box) {
            _context6.next = 6;
            break;
          }

          return _context6.abrupt("return", res.status(400).json({
            message: "No box found."
          }));

        case 6:
          sortedItems = box.items.sort(function (a, b) {
            return b.createdAt - a.createdAt;
          });
          box.items = sortedItems;
          return _context6.abrupt("return", res.status(200).json(_objectSpread({}, box._doc)));

        case 9:
        case "end":
          return _context6.stop();
      }
    }
  });
};

exports.showBoxById = showBoxById;

var sendContactMessage = function sendContactMessage(req, res) {
  var _req$body3, name, email, message;

  return regeneratorRuntime.async(function sendContactMessage$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          _req$body3 = req.body, name = _req$body3.name, email = _req$body3.email, message = _req$body3.message;

          if (!(!name || !email || !message)) {
            _context7.next = 3;
            break;
          }

          return _context7.abrupt("return", res.status(400).json({
            message: "Please provide a name, email, and message"
          }));

        case 3:
          _context7.prev = 3;
          _context7.next = 6;
          return regeneratorRuntime.awrap(_nodemailer["default"].sendMail({
            from: "\"".concat(process.env.SITE_NAME, "\" <").concat(process.env.SMTP_USER, ">"),
            to: process.env.ADMIN_EMAIL,
            subject: "Hello Elias! New message from ".concat(name),
            text: "".concat(name, " wants to contact you."),
            html: "\n\n      <h1>Hello Elias!</h1>\n      <h3>This message is from ".concat(process.env.BASE_URL, "</h3>\n      <p>\n      <b>Name:</b> ").concat(name, " <br />\n      <b>Email:</b> ").concat(email, " <br />\n      <b>Message:</b> ").concat(message, "\n      </p>")
          }));

        case 6:
          _context7.next = 12;
          break;

        case 8:
          _context7.prev = 8;
          _context7.t0 = _context7["catch"](3);
          console.log(_context7.t0);
          return _context7.abrupt("return", res.status(500).json({
            message: "Email address rejected because domain not found."
          }));

        case 12:
          return _context7.abrupt("return", res.status(200).json({
            message: "Message sent successfully."
          }));

        case 13:
        case "end":
          return _context7.stop();
      }
    }
  }, null, null, [[3, 8]]);
};

exports.sendContactMessage = sendContactMessage;

var getBoxItems = function getBoxItems(req, res) {
  var boxId, privateCode, query, box, sortedItems;
  return regeneratorRuntime.async(function getBoxItems$(_context8) {
    while (1) {
      switch (_context8.prev = _context8.next) {
        case 0:
          boxId = req.params.boxId;
          privateCode = req.query.privateCode;
          query = {
            _id: boxId
          };
          _context8.next = 5;
          return regeneratorRuntime.awrap(_Box["default"].findOne(query));

        case 5:
          box = _context8.sent;

          if (box) {
            _context8.next = 8;
            break;
          }

          return _context8.abrupt("return", res.status(400).json({
            message: "No box found."
          }));

        case 8:
          if (!box.isPrivate) {
            _context8.next = 15;
            break;
          }

          if (!(privateCode !== "" && privateCode !== box.privateCode.toString())) {
            _context8.next = 13;
            break;
          }

          return _context8.abrupt("return", res.status(400).json({
            message: "Please enter the right private code."
          }));

        case 13:
          if (!(privateCode === "")) {
            _context8.next = 15;
            break;
          }

          return _context8.abrupt("return", res.status(400).json({
            message: "Box is private."
          }));

        case 15:
          sortedItems = box.items.sort(function (a, b) {
            return b.createdAt - a.createdAt;
          });
          box.items = sortedItems;
          return _context8.abrupt("return", res.status(200).json(_toConsumableArray(box.items)));

        case 18:
        case "end":
          return _context8.stop();
      }
    }
  });
};

exports.getBoxItems = getBoxItems;

var getBoxItem = function getBoxItem(req, res) {
  return regeneratorRuntime.async(function getBoxItem$(_context9) {
    while (1) {
      switch (_context9.prev = _context9.next) {
        case 0:
        case "end":
          return _context9.stop();
      }
    }
  });
}; // Items


exports.getBoxItem = getBoxItem;

var createItem = function createItem(req, res) {
  var _req$body4, boxId, description, media, mediaType, mediaPath, err, theBox;

  return regeneratorRuntime.async(function createItem$(_context10) {
    while (1) {
      switch (_context10.prev = _context10.next) {
        case 0:
          // get the files
          _req$body4 = req.body, boxId = _req$body4.boxId, description = _req$body4.description;
          media = req.file;
          mediaType = undefined, mediaPath = undefined; // Return the errors if there are any

          err = (0, _expressValidator.validationResult)(req);

          if (err.isEmpty()) {
            _context10.next = 6;
            break;
          }

          return _context10.abrupt("return", res.status(422).json({
            message: err.array()[0].msg
          }));

        case 6:
          if (!(description === "" && !media)) {
            _context10.next = 8;
            break;
          }

          return _context10.abrupt("return", res.status(400).json({
            message: "Please give a description or upload a file."
          }));

        case 8:
          if (!media) {
            _context10.next = 14;
            break;
          }

          // get the file path
          mediaPath = "".concat(process.env.UPLOADS_PATH, "/").concat(media.filename); // get the file mediaType

          mediaType = media.mimetype; // if the file mediaType is not an image or an audio file, return an error

          if (!(mediaType !== "image/png" && mediaType !== "image/jpg" && mediaType !== "image/jpeg" && mediaType !== "audio/mpeg" && mediaType !== "audio/wav")) {
            _context10.next = 13;
            break;
          }

          return _context10.abrupt("return", res.status(400).json({
            message: "Please provide a valid file"
          }));

        case 13:
          mediaType = mediaType.split("/")[0];

        case 14:
          _context10.next = 16;
          return regeneratorRuntime.awrap(_Box["default"].findById(boxId));

        case 16:
          theBox = _context10.sent;

          if (theBox) {
            _context10.next = 19;
            break;
          }

          return _context10.abrupt("return", res.status(400).json({
            message: "Box not found"
          }));

        case 19:
          theBox.items.push({
            mediaType: mediaType,
            description: description,
            mediaPath: mediaPath
          });
          _context10.next = 22;
          return regeneratorRuntime.awrap(theBox.save());

        case 22:
          return _context10.abrupt("return", res.status(201).json({
            message: "Item added to the box"
          }));

        case 23:
        case "end":
          return _context10.stop();
      }
    }
  });
};

exports.createItem = createItem;

var updateItem = function updateItem(req, res) {
  var _req$body5, itemId, description, mediaPath, media, mediaType, newMediaPath, err, box;

  return regeneratorRuntime.async(function updateItem$(_context11) {
    while (1) {
      switch (_context11.prev = _context11.next) {
        case 0:
          _req$body5 = req.body, itemId = _req$body5.itemId, description = _req$body5.description, mediaPath = _req$body5.mediaPath;
          media = req.file;
          mediaType = undefined, newMediaPath = undefined; // Return the errors if there are any

          err = (0, _expressValidator.validationResult)(req);

          if (err.isEmpty()) {
            _context11.next = 6;
            break;
          }

          return _context11.abrupt("return", res.status(422).json({
            message: err.array()[0].msg
          }));

        case 6:
          if (!(description === "" && !media && mediaPath === "")) {
            _context11.next = 8;
            break;
          }

          return _context11.abrupt("return", res.status(400).json({
            message: "Please give a description or upload a file."
          }));

        case 8:
          if (!media) {
            _context11.next = 14;
            break;
          }

          newMediaPath = "".concat(process.env.UPLOADS_PATH, "/").concat(media.filename);
          mediaType = media.mimetype; // if the file mediaType is not an image or an audio file, return an error

          if (!(mediaType !== "image/png" && mediaType !== "image/jpg" && mediaType !== "image/jpeg" && mediaType !== "audio/mpeg" && mediaType !== "audio/wav")) {
            _context11.next = 13;
            break;
          }

          return _context11.abrupt("return", res.status(400).json({
            message: "Please provide a valid file"
          }));

        case 13:
          mediaType = mediaType.split("/")[0];

        case 14:
          _context11.next = 16;
          return regeneratorRuntime.awrap(_Box["default"].findOne({
            user: req.user._id,
            "items._id": itemId
          }));

        case 16:
          box = _context11.sent;

          if (box) {
            _context11.next = 19;
            break;
          }

          return _context11.abrupt("return", res.status(400).json({
            message: "Item not found"
          }));

        case 19:
          // Find the item and update it
          box.items = box.items.map(function (item) {
            if (item._id.toString() === itemId) {
              try {
                if (item.mediaPath && newMediaPath) {
                  // if there is a new media, remove the media in the uploads folder
                  _fs["default"].unlinkSync(_path["default"].join(_dirname, item.mediaPath));
                } else if (item.mediaPath && !mediaPath) {
                  // if there is no media, remove the media in the uploads folder
                  _fs["default"].unlinkSync(_path["default"].join(_dirname, item.mediaPath));
                }
              } catch (error) {
                console.log(error);
              }

              if (newMediaPath) {
                // if there is a new media, update the media path and media type
                item.mediaPath = newMediaPath;
                item.mediaType = mediaType;
              } else if (!mediaPath) {
                // if there is no media , remove the media path and media type
                item.mediaPath = undefined;
                item.mediaType = undefined;
              }

              item.description = description;
            }

            return item;
          });
          _context11.next = 22;
          return regeneratorRuntime.awrap(box.save());

        case 22:
          return _context11.abrupt("return", res.status(200).json({
            message: "Item updated successfully."
          }));

        case 23:
        case "end":
          return _context11.stop();
      }
    }
  });
};

exports.updateItem = updateItem;

var deleteItem = function deleteItem(req, res) {
  var itemId, box;
  return regeneratorRuntime.async(function deleteItem$(_context12) {
    while (1) {
      switch (_context12.prev = _context12.next) {
        case 0:
          itemId = req.params.itemId;

          if (itemId) {
            _context12.next = 3;
            break;
          }

          return _context12.abrupt("return", res.status(400).json({
            message: "Please provide an item ID"
          }));

        case 3:
          _context12.next = 5;
          return regeneratorRuntime.awrap(_Box["default"].findOne({
            user: req.user._id,
            "items._id": itemId
          }));

        case 5:
          box = _context12.sent;

          if (box) {
            _context12.next = 8;
            break;
          }

          return _context12.abrupt("return", res.status(400).json({
            message: "Item not found"
          }));

        case 8:
          box.items = box.items.filter(function (item) {
            if (item._id.toString() === itemId) {
              if (item.mediaPath) {
                // remove the media in the uploads folder
                _fs["default"].unlinkSync(_path["default"].join(_dirname, item.mediaPath));
              }
            } else {
              return item;
            }
          });
          _context12.next = 11;
          return regeneratorRuntime.awrap(box.save());

        case 11:
          return _context12.abrupt("return", res.status(200).json({
            message: "Item deleted successfully."
          }));

        case 12:
        case "end":
          return _context12.stop();
      }
    }
  });
};

exports.deleteItem = deleteItem;
var _default = {
  home: home,
  getBoxes: getBoxes,
  getBox: getBox,
  createBox: createBox,
  updateBox: updateBox,
  deleteBox: deleteBox,
  // Public stuff
  showBoxById: showBoxById,
  getBoxItems: getBoxItems,
  getBoxItem: getBoxItem,
  // Items
  createItem: createItem,
  updateItem: updateItem,
  deleteItem: deleteItem,
  sendContactMessage: sendContactMessage
};
exports["default"] = _default;