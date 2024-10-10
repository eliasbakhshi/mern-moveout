import { Router } from "express";
import asyncHandler from "express-async-handler";
import {
  register,
  login,
  loginWithGoogle,
  logout,
  verifyEmail,
  sendVerificationEmail,
  sendResetPasswordEmail,
  getCurrentUser,
  updateCurrentUser,
  deleteUser,
  verifyTokenResetPassword,
  updateUserPasswordById,
  getNamesAndEmails,
  shareBox,
  shareLabel,
  deactivateCurrentUser,
  reactivateCurrentUser,
  sendDeleteEmail,
} from "../controllers/user.js";
import { body } from "express-validator";
import User from "../models/User.js";
import validateToken from "../middlewares/validateToken.js";
import checkAccess from "../middlewares/checkAccess.js";

const router = Router();

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
  "/login-with-google",
  body("email").trim().isEmail().withMessage("The email is not valid."),
  asyncHandler(loginWithGoogle),
);

router.post("/logout", asyncHandler(logout));

router.put("/verify-email", asyncHandler(verifyEmail));

router.post(
  "/verify-email",
  body("email").trim().isEmail().withMessage("The email is not valid."),
  asyncHandler(sendVerificationEmail),
);

router.post(
  "/reset-password",
  body("email").trim().isEmail().withMessage("The email is not valid."),
  asyncHandler(sendResetPasswordEmail),
);
router.get("/reset-password/:token", asyncHandler(verifyTokenResetPassword));

router.put(
  "/reset-password",
  body(
    "password",
    "The password must be alphanumeric and at least 6 characters long.",
  )
    .isLength({ min: 6, max: 100 })
    .isAlphanumeric(),
  body("confirmPassword").custom((value, { req }) => {
    if (value && value !== req.body.password) {
      throw new Error("The passwords do not match.");
    }
    return true;
  }),
  asyncHandler(updateUserPasswordById),
);

router.put(
  "/users",
  validateToken,
  checkAccess("user"),
  body("email").isEmail().withMessage("The email is not correct."),
  body(
    "password",
    "The password must be alphanumeric and at least 6 characters long.",
  )
    .optional({ checkFalsy: true })
    .isLength({ min: 6, max: 100 })
    .isAlphanumeric(),
  body("confirmPassword")
    .optional({ checkFalsy: true })
    .custom((value, { req }) => {
      if (value && value !== req.body.password) {
        throw new Error("The passwords do not match.");
      }
      return true;
    }),
  asyncHandler(updateCurrentUser),
);

router.get(
  "/users/current",
  validateToken,
  checkAccess("user"),
  asyncHandler(getCurrentUser),
);

router.get(
  "/users/get-name-email",
  validateToken,
  checkAccess("user"),
  asyncHandler(getNamesAndEmails),
);

router.post(
  "/users/share-box",
  validateToken,
  checkAccess("user"),
  body("email").trim().isEmail().withMessage("The email is not valid."),
  asyncHandler(shareBox),
);

router.post(
  "/users/share-label",
  validateToken,
  checkAccess("user"),
  body("email").trim().isEmail().withMessage("The email is not valid."),
  asyncHandler(shareLabel),
);

router.put(
  "/users/deactivate-current",
  validateToken,
  checkAccess("user"),
  asyncHandler(deactivateCurrentUser),
);

router.put(
  "/users/reactivate-current",
  validateToken,
  checkAccess("user"),
  asyncHandler(reactivateCurrentUser),
);

router.put(
  "/users/send-delete-email",
  validateToken,
  checkAccess("user"),
  asyncHandler(sendDeleteEmail),
);

router.delete(
  "/users/delete",
  validateToken,
  checkAccess("user"),
  asyncHandler(deleteUser),
);

export default router;

// TODO: redirect to verification page after the token was expired or changed or invalid
// TODO: Implement reset password
