import { Router } from "express";
import asyncHandler from "express-async-handler";
import {
  register,
  registerWithGoogle,
  login,
  loginWithGoogle,
  logout,
  verifyEmail,
  sendVerificationEmail,
  sendResetPasswordEmail,
  getUsers,
  getDeletedUsers,
  getCurrentUser,
  updateCurrentUser,
  deleteCurrentUser,
  createUser,
  editUser,
  deleteUser,
  recoverUser,
  deleteUserPermanently,
  sendMarketingEmail,
  changeUserStatus,
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
import getMedia from "../middlewares/multer.js";

const router = Router();

router.post(
  "/register",
  body("email")
    .trim()
    .isEmail()
    .withMessage("The email is not correct.")
    .custom((value) => {
      return User.findOne({ email: value }).then((user) => {
        if (user) {
          return Promise.reject("The email is already in use.");
        }
      });
    }),
  body("password")
    .isLength({ min: 6, max: 100 })
    .withMessage(
      "Password must be at least 6 characters long and at most 100 characters long.",
    )
    .isAlphanumeric()
    .withMessage("Password must contain only alphanumeric characters."),
  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("The passwords do not match.");
    }
    return true;
  }),
  asyncHandler(register),
);

router.post(
  "/register-with-google",
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
  asyncHandler(registerWithGoogle),
);

router.post(
  "/login",
  body("email").trim().isEmail().withMessage("The email is not valid."),
  body("password")
    .isLength({ min: 6, max: 100 })
    .withMessage(
      "Password must be at least 6 characters long and at most 100 characters long.",
    )
    .isAlphanumeric()
    .withMessage("Password must contain only alphanumeric characters."),
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
  body("password")
    .isLength({ min: 6, max: 100 })
    .withMessage(
      "Password must be at least 6 characters long and at most 100 characters long.",
    )
    .isAlphanumeric()
    .withMessage("Password must contain only alphanumeric characters."),
  body("confirmPassword").custom((value, { req }) => {
    if (value && value !== req.body.password) {
      throw new Error("The passwords do not match.");
    }
    return true;
  }),
  asyncHandler(updateUserPasswordById),
);

router.get(
  "/users",
  validateToken,
  checkAccess("admin"),
  asyncHandler(getUsers),
);

router.get(
  "/users/deleted",
  validateToken,
  checkAccess("admin"),
  asyncHandler(getDeletedUsers),
);

router.put(
  "/users/current",
  validateToken,
  checkAccess("user"),
  getMedia,
  body("email").trim().isEmail().withMessage("The email is not correct."),
  body("password")
    .isLength({ min: 6, max: 100 })
    .withMessage(
      "Password must be at least 6 characters long and at most 100 characters long.",
    )
    .optional({ checkFalsy: true })
    .isAlphanumeric()
    .withMessage("Password must contain only alphanumeric characters."),
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
  "/users/current",
  validateToken,
  checkAccess("user"),
  asyncHandler(deleteCurrentUser),
);

router.post(
  "/users",
  validateToken,
  checkAccess("admin"),
  body("name").trim().isString().withMessage("The name is not valid."),
  body("email").trim().isEmail().withMessage("The email is not valid."),
  asyncHandler(createUser),
);

router.put(
  "/users",
  validateToken,
  checkAccess("admin"),
  body("name").trim().isString().withMessage("The name is not valid."),
  body("email").trim().isEmail().withMessage("The email is not valid."),
  asyncHandler(editUser),
);

router.delete(
  "/users",
  validateToken,
  checkAccess("admin"),
  asyncHandler(deleteUser),
);

router.put(
  "/users/status",
  validateToken,
  checkAccess("admin"),
  asyncHandler(changeUserStatus),
);

router.put(
  "/users/recover",
  validateToken,
  checkAccess("admin"),
  asyncHandler(recoverUser),
);

router.delete(
  "/users/permanently",
  validateToken,
  checkAccess("admin"),
  asyncHandler(deleteUserPermanently),
);

router.post(
  "/users/MarketingEmail",
  validateToken,
  checkAccess("admin"),
  asyncHandler(sendMarketingEmail),
);

export default router;

// TODO: redirect to verification page after the token was expired or changed or invalid
// TODO: Implement reset password
