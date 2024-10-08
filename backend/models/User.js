import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
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
    active: {
      type: Boolean,
      default: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
    },
    resetPasswordToken: {
      type: String,
    },
    emailVerificationTokenExpiresAt: {
      type: String,
    },
    resetPasswordTokenExpiresAt: {
      type: String,
    },
  },
  { timestamps: true },
);

export default model("User", userSchema);
