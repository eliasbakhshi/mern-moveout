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
    type: String
  },
  value: {
    type: Number
  },
  mediaPath: {
    type: String
  },
  deletedAt: {
    type: Date
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
  privateCode: {
    type: Number
  },
  type: {
    type: String,
    required: true
  },
  currency: {
    type: String,
    "default": "SEK"
  },
  items: [itemSchema]
}, {
  timestamps: true
}); // Export the model

var _default = (0, _mongoose.model)("Box", boxSchema);

exports["default"] = _default;