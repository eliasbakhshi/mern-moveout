import { Router } from "express";
import asyncHandler from "express-async-handler";
import {
  login,
  register,
  logout,
  verifyEmail,
  sendVerificationEmail,
} from "../controllers/user.js";
import { body } from "express-validator";
import User from "../models/User.js";

const router = Router();

router.post(
  "/login",
  body("email").trim().isEmail().withMessage("The email is not valid."),
  body(
    "password",
    "The password must be alphanumeric and at least 6 characters long.",
  )
    .isLength({ min: 6, max: 100 })
    .isAlphanumeric(),
  asyncHandler(login),
);
router.post(
  "/register",
  body("email")
    .isEmail()
    .withMessage("The email is not correct.")
    .custom((value) => {
      return User.findOne({ email: value }).then((user) => {
        if (user) {
          return Promise.reject("The email is already in use.");
        }
      });
    }),
  body(
    "password",
    "The password must be alphanumeric and at least 6 characters long.",
  )
    .isLength({ min: 6, max: 100 })
    .isAlphanumeric(),
  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("The passwords do not match.");
    }
    return true;
  }),
  asyncHandler(register),
);
router.post("/logout", asyncHandler(logout));
router.put("/verify-email", asyncHandler(verifyEmail));
router.post("/verify-email", body("email").trim().isEmail().withMessage("The email is not valid."), asyncHandler(sendVerificationEmail));

export default router;

// TODO: redirect to verification page after the token was expired or changed or invalid
// TODO: Implement reset password
