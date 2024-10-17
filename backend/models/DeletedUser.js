import { Schema, model } from "mongoose";

const deletedUserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    password: {
      type: String,
    },
    email: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      default: "user",
    },
    mediaPath: {
      type: String,
    },
    boxes: [
      {
        type: Schema.Types.ObjectId,
        ref: "Box",
      },
    ],
    registeredWith: [String],
    lastActive: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    reminderSent: {
      type: Boolean,
      default: false,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
    },
    emailDeleteToken: {
      type: String,
    },
    resetPasswordToken: {
      type: String,
    },
    emailVerificationTokenExpiresAt: {
      type: String,
    },
    emailDeleteTokenExpiresAt: {
      type: String,
    },
    resetPasswordTokenExpiresAt: {
      type: String,
    },
    deletedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

export default model("DeletedUser", deletedUserSchema);
