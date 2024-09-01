import { Router } from "express";
import storeController from "../controllers/store.js";
import asyncHandler from "express-async-handler";
import validateToken from "../middlewares/validateToken.js";
import checkAccess from "../middlewares/checkAccess.js";

const router = Router();

router.get("", asyncHandler(storeController.home));
router.get("", validateToken, checkAccess("user"), asyncHandler(storeController.home2));

export default router;
