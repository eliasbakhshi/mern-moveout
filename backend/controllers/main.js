import { Console } from "console";
import Box from "../models/Box.js";
import { validationResult } from "express-validator";
import fs from "fs";
import path from "path";

const __dirname = path.resolve();

export const home = (req, res) => {
  return res.status(200).json({ message: "Welcome to the MERN Store API" });
};

export const getBoxes = async (req, res) => {
  const boxes = await Box.find({ user: req.user._id }).sort({
    createdAt: 1,
  });
  if (!boxes) {
    return res.status(400).json({ message: "No box found." });
  }
  const sortedItems = boxes.sort((a, b) => b.createdAt - a.createdAt);
  return res.status(200).json({ boxes: sortedItems });
};
export const getBox = async (req, res) => {
  const { boxId } = req.params;
  const box = await Box.findOne({ user: req.user._id, _id: boxId });
  if (!box) {
    return res.status(400).json({ message: "No box found." });
  }

  const sortedItems = box.items.sort((a, b) => b.createdAt - a.createdAt);
  box.items = sortedItems;

  return res.status(200).json({ box });
};
export const createBox = async (req, res) => {
  const { name, labelNum } = req.body;
  if (!name || !labelNum) {
    return res
      .status(400)
      .json({ message: "Please provide a name and a label" });
  }

  const box = new Box({
    name,
    labelNum,
    user: req.user._id,
  });

  const newBox = await box.save();

  return res.status(201).json({ id: newBox._id, message: "Box created." });
};
export const updateBox = async (req, res) => {
  const { name, labelNum, boxId } = req.body;
  if (!name || !labelNum || !boxId) {
    return res.status(400).json({
      message: "Please provide a name, a label, and a box ID",
    });
  }

  const box = await Box.findOne({ user: req.user._id, _id: boxId });

  if (!box) {
    return res.status(400).json({ message: "Box not found" });
  }

  box.name = name;
  box.labelNum = labelNum;

  await box.save();

  return res.status(200).json({ message: "Box updated successfully." });
};
export const deleteBox = async (req, res) => {
  const { boxId } = req.params;

  if (!boxId) {
    return res.status(400).json({ message: "Please provide an box ID" });
  }

  const box = await Box.findOneAndDelete({ user: req.user._id, _id: boxId });

  if (!box) {
    return res.status(400).json({ message: "Box not found" });
  }

  return res.status(200).json({ message: "Box deleted successfully." });
};
export const getBoxItems = async (req, res) => {
  const { boxId } = req.params;
  const box = await Box.findOne({ user: req.user._id, _id: boxId }).sort({
    createdAt: 1,
  });
  if (!box) {
    return res.status(400).json({ message: "Box not found" });
  }
  const sortedItems = box.items.sort((a, b) => b.createdAt - a.createdAt);
  return res.status(200).json({ items: sortedItems });
};
export const getBoxItem = async (req, res) => {};
export const createItem = async (req, res) => {
  // get the files
  const { boxId, description } = req.body;
  const media = req.file;
  let mediaType = undefined,
    mediaPath = undefined;

  // Return the errors if there are any
  const err = validationResult(req);
  if (!err.isEmpty()) {
    return res.status(422).json({ message: err.array()[0].msg });
  }

  if (description === "" && !media) {
    return res
      .status(400)
      .json({ message: "Please give a description or upload a file." });
  }

  // if there is a file, check if it is an image or an audio file
  if (media) {
    // get the file path
    mediaPath = `${process.env.UPLOADS_PATH}/${media.filename}`;
    // get the file mediaType
    const mediaType = media.mimetype;
    // if the file mediaType is not an image or an audio file, return an error
    if (
      mediaType !== "image/png" &&
      mediaType !== "image/jpg" &&
      mediaType !== "image/jpeg" &&
      mediaType !== "audio/mpeg"
    ) {
      return res.status(400).json({ message: "Please provide a valid file" });
    }
  }

  const theBox = await Box.findById(boxId);
  if (!theBox) {
    return res.status(400).json({ message: "Box not found" });
  }

  theBox.items.push({
    mediaType,
    description,
    mediaPath,
  });

  await theBox.save();

  return res.status(201).json({ message: "Item added to the box" });
};

export const updateItem = async (req, res) => {
  const { itemId, description, mediaPath } = req.body;
  const media = req.file;
  let mediaType = undefined,
    newMediaPath = undefined;

  // Return the errors if there are any
  const err = validationResult(req);
  if (!err.isEmpty()) {
    return res.status(422).json({ message: err.array()[0].msg });
  }

  if (description === "" && !media) {
    // if there is no description and no media, return an error
    return res
      .status(400)
      .json({ message: "Please give a description or upload a file." });
  }

  // if there is a file, check if it is an image or an audio file
  if (media) {
    newMediaPath = `${process.env.UPLOADS_PATH}/${media.filename}`;
    mediaType = media.mimetype;
    // if the file mediaType is not an image or an audio file, return an error
    if (
      mediaType !== "image/png" &&
      mediaType !== "image/jpg" &&
      mediaType !== "image/jpeg" &&
      mediaType !== "audio/mpeg"
    ) {
      return res.status(400).json({ message: "Please provide a valid file" });
    }
    mediaType = mediaType.split("/")[0];
  }

  const box = await Box.findOne({ user: req.user._id, "items._id": itemId });

  if (!box) {
    return res.status(400).json({ message: "Item not found" });
  }

  // Find the item and update it
  box.items = box.items.map((item) => {
    if (item._id.toString() === itemId) {
      try {
        if (item.mediaPath && newMediaPath) {
          // if there is a new media, remove the media in the uploads folder
          fs.unlinkSync(path.join(__dirname, item.mediaPath));
        } else if (item.mediaPath && !mediaPath) {
          // if there is no media, remove the media in the uploads folder
          fs.unlinkSync(path.join(__dirname, item.mediaPath));
        }
      } catch (error) {
        console.log(error);
      }

      if (newMediaPath) {
        // if there is a new media, update the media path and media type
        item.mediaPath = newMediaPath;
        item.mediaType = mediaType;
      } else if (!mediaPath) {
        // if there is no media , remove the media path and media type
        item.mediaPath = undefined;
        item.mediaType = undefined;
      }

      item.description = description;
    }
    return item;
  });

  await box.save();

  return res.status(200).json({ message: "Item updated successfully." });
};

export const deleteItem = async (req, res) => {
  const { itemId } = req.params;

  if (!itemId) {
    return res.status(400).json({ message: "Please provide an item ID" });
  }

  const box = await Box.findOne({ user: req.user._id, "items._id": itemId });

  if (!box) {
    return res.status(400).json({ message: "Item not found" });
  }

  box.items = box.items.filter((item) => {
    if (item._id.toString() === itemId) {
      if (item.mediaPath) {
        // remove the media in the uploads folder
        fs.unlinkSync(path.join(__dirname, item.mediaPath));
      }
    } else {
      return item;
    }
  });
  await box.save();

  return res.status(200).json({ message: "Item deleted successfully." });
};

export default {
  home,
  getBoxes,
  getBox,
  createBox,
  updateBox,
  deleteBox,
  getBoxItems,
  getBoxItem,
  createItem,
  updateItem,
  deleteItem,
};
