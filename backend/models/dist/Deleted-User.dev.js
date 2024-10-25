"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _mongoose = require("mongoose");

var deletedUserSchema = new _mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  password: {
    type: String
  },
  email: {
    type: String,
    required: true,
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
  registeredWith: [String],
  lastActive: {
    type: Date,
    "default": Date.now
  },
  isActive: {
    type: Boolean,
    "default": true
  },
  reminderSent: {
    type: Boolean,
    "default": false
  },
  emailVerified: {
    type: Boolean,
    "default": false
  },
  emailVerificationToken: {
    type: String
  },
  emailDeleteToken: {
    type: String
  },
  resetPasswordToken: {
    type: String
  },
  emailVerificationTokenExpiresAt: {
    type: String
  },
  emailDeleteTokenExpiresAt: {
    type: String
  },
  resetPasswordTokenExpiresAt: {
    type: String
  },
  deletedAt: {
    type: Date,
    required: false
  }
}, {
  timestamps: true
});

var _default = (0, _mongoose.model)("DeletedUser", deletedUserSchema);

exports["default"] = _default;
