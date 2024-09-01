import { Router } from "express";
import asyncHandler from "express-async-handler";
import adminController from "../controllers/admin.js";
import validateToken from "../middlewares/validateToken.js";
import checkAccess from "../middlewares/checkAccess.js";
import userController from "../controllers/user.js"

const router = Router();

router.post("/", validateToken, checkAccess("admin"), asyncHandler(adminController.dashboard));
router.post("/add-product", validateToken, checkAccess("admin"), asyncHandler(adminController.addProduct));
router.get("/users", validateToken, checkAccess("admin"), asyncHandler(userController.getAllUsers));
router.get("/users/current", validateToken, checkAccess("user"), asyncHandler(userController.getCurrentUser));
router.patch("/users/current", validateToken, checkAccess("user"), asyncHandler(userController.updateCurrentUser));
router.delete("/users/:userId", validateToken, checkAccess("admin"), asyncHandler(userController.deleteUser));
router.get("/users/:userId", validateToken, checkAccess("admin"), asyncHandler(userController.getUserById));
router.patch("/users/:userId", validateToken, checkAccess("admin"), asyncHandler(userController.updateUserById));

export default router;
