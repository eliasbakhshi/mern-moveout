import { Router } from "express";
import asyncHandler from "express-async-handler";
import userController from "../controllers/user.js";
import { body } from "express-validator";
import User from "../models/User.js";

const router = Router();

router.post("/login", body("email").trim().isEmail().withMessage("The email is not valid."), body("password", "The password must be alphanumeric and at least 6 characters long.").isLength({ min: 6, max: 100 }).isAlphanumeric(), asyncHandler(userController.login));
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
    body("password", "The password must be alphanumeric and at least 6 characters long.").isLength({ min: 6, max: 100 }).isAlphanumeric(),
    body("confirmPassword").custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error("The passwords do not match.");
        }
        return true;
    }),
    asyncHandler(userController.register)
);
router.post("/logout", asyncHandler(userController.logout));

export default router;

// TODO: Implement reset password
