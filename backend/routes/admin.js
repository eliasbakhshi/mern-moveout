import { Router } from "express";
import asyncHandler from "express-async-handler";
import {
  dashboard,
  getAllUsers,
  deleteUser,
  getUserById,
  updateUserById,
} from "../controllers/admin.js";
import validateToken from "../middlewares/validateToken.js";
import checkAccess from "../middlewares/checkAccess.js";

const router = Router();

router.post("/", validateToken, checkAccess("admin"), asyncHandler(dashboard));
router.get(
  "/users",
  validateToken,
  checkAccess("admin"),
  asyncHandler(getAllUsers),
);
router.delete(
  "/users/:userId",
  validateToken,
  checkAccess("admin"),
  asyncHandler(deleteUser),
);
router.get(
  "/users/:userId",
  validateToken,
  checkAccess("admin"),
  asyncHandler(getUserById),
);
router.patch(
  "/users/:userId",
  validateToken,
  checkAccess("admin"),
  asyncHandler(updateUserById),
);

export default router;
