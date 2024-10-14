import { Router } from "express";
import {
  home,
  getBoxes,
  getBox,
  createBox,
  updateBox,
  deleteBox,
  changeBoxStatus,
  showBoxById,
  sendContactMessage,
  getBoxItems,
  getBoxItem,
  createItem,
  updateItem,
  deleteItem,
} from "../controllers/main.js";
import asyncHandler from "express-async-handler";
import validateToken from "../middlewares/validateToken.js";
import checkAccess from "../middlewares/checkAccess.js";
import { body } from "express-validator";
import getMedia from "../middlewares/multer.js";

const router = Router();

router.get("/", asyncHandler(home));

router.get(
  "/boxes",
  validateToken,
  checkAccess("user"),
  asyncHandler(getBoxes),
);

router.get(
  "/boxes/:boxId",
  validateToken,
  checkAccess("user"),
  asyncHandler(getBox),
);

router.post(
  "/boxes",
  validateToken,
  checkAccess("user"),
  body("name").trim().isString().notEmpty(),
  body("label").trim().isString().notEmpty(),
  asyncHandler(createBox),
);

router.put(
  "/boxes",
  validateToken,
  checkAccess("user"),
  body("name").trim().isString().notEmpty(),
  body("label").trim().isString().notEmpty(),
  asyncHandler(updateBox),
);

router.delete(
  "/boxes/:boxId",
  validateToken,
  checkAccess("user"),
  asyncHandler(deleteBox),
);

router.put(
  "/boxes/status",
  validateToken,
  checkAccess("user"),
  asyncHandler(changeBoxStatus),
);

// Public stuff
router.get("/boxes/:boxId/show", asyncHandler(showBoxById));

router.post("/contact", asyncHandler(sendContactMessage));

// Items
router.get("/boxes/:boxId/items", asyncHandler(getBoxItems));

router.get(
  "/boxes/:boxId/items/:itemId",
  validateToken,
  checkAccess("user"),
  asyncHandler(getBoxItem),
);

router.post(
  "/boxes/items",
  validateToken,
  checkAccess("user"),
  body("description").optional().trim().isString(),
  body("mediaPath").optional().trim().isString(),
  getMedia,
  asyncHandler(createItem),
);

router.put(
  "/boxes/items",
  validateToken,
  checkAccess("user"),
  body("description").optional().trim().isString(),
  body("mediaPath").optional().trim().isString(),
  getMedia,
  asyncHandler(updateItem),
);

router.delete(
  "/boxes/items/:itemId",
  validateToken,
  checkAccess("user"),
  asyncHandler(deleteItem),
);

export default router;
