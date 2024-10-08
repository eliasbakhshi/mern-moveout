"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _mongoose = require("mongoose");

var userSchema = new _mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  role: {
    type: String,
    required: true,
    "default": "user"
  },
  mediaPath: {
    type: String
  },
  boxes: [{
    type: _mongoose.Schema.Types.ObjectId,
    ref: "Box"
  }],
  active: {
    type: Boolean,
    "default": true
  },
  emailVerified: {
    type: Boolean,
    "default": false
  },
  emailVerificationToken: {
    type: String
  },
  resetPasswordToken: {
    type: String
  },
  emailVerificationTokenExpiresAt: {
    type: String
  },
  resetPasswordTokenExpiresAt: {
    type: String
  }
}, {
  timestamps: true
});

var _default = (0, _mongoose.model)("User", userSchema);

exports["default"] = _default;