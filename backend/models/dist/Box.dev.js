"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _mongoose = require("mongoose");

// Define the schema for the items
var itemSchema = new _mongoose.Schema({
  mediaType: {
    type: String
  },
  description: {
    type: String,
    required: false // Optional field

  },
  mediaPath: {
    type: String
  }
}, {
  timestamps: true
}); // Define the schema for the box

var boxSchema = new _mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  labelNum: {
    type: Number,
    required: true
  },
  user: {
    type: _mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  isPrivate: {
    type: Boolean,
    required: true
  },
  items: [itemSchema] // Use the itemSchema for the items array

}, {
  timestamps: true
}); // Export the model

var _default = (0, _mongoose.model)("Box", boxSchema);

exports["default"] = _default;