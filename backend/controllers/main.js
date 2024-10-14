import Box from "../models/Box.js";
import { validationResult } from "express-validator";
import fs from "fs";
import path from "path";
import transporter from "../config/nodemailer.js";
import ShortUniqueId from "short-unique-id";
import User from "../models/User.js";

const uid = new ShortUniqueId({ length: 6, dictionary: "number" });

const __dirname = path.resolve();

export const home = (req, res) => {
  return res.status(200).json({ message: "Welcome to the Move out API" });
};

export const getBoxes = async (req, res) => {
  // Check if the user is active
  const user = await User.findOne({ _id: req.user._id, isActive: true });
  if (!user) {
    return res.status(400).json({ message: "User is inactive." });
  }

  // Get the boxes
  const boxes = await Box.find({ user: req.user._id }).sort({
    createdAt: 1,
  });

  if (!boxes) {
    return res.status(400).json({ message: "No box found." });
  }
  return res.status(200).json({ boxes });
};

export const getBox = async (req, res) => {
  const { boxId } = req.params;
  let query = { _id: boxId };

  if (req.user.role !== "admin") query = { ...query, user: req.user._id };

  const box = await Box.findOne(query).populate("user");

  // Check if the user is active
  if (!box.user.isActive) {
    return res.status(400).json({ message: "User is inactive." });
  }

  if (!box) {
    return res.status(400).json({ message: "No box found." });
  }

  const sortedItems = box.items.sort((a, b) => b.createdAt - a.createdAt);
  box.items = sortedItems;

  return res.status(200).json({ ...box._doc });
};

export const createBox = async (req, res) => {
  // Check if the user is active
  const user = await User.findOne({ _id: req.user._id, isActive: true });
  if (!user) {
    return res.status(400).json({ message: "User is inactive." });
  }
  const { name, labelNum, isPrivate } = req.body;
  const privateCode = uid.randomUUID(6);
  if (!name || !labelNum || isPrivate === undefined) {
    return res
      .status(400)
      .json({ message: "Please provide a name and a label" });
  }

  const box = new Box({
    name,
    labelNum,
    user: req.user._id,
    isPrivate,
    privateCode: isPrivate ? privateCode : undefined,
  });

  const newBox = await box.save();

  // Add new box to the user's boxes
  req.user.boxes.push(newBox._id);
  await req.user.save();

  return res.status(201).json({ id: newBox._id, message: "Box created." });
};

export const updateBox = async (req, res) => {
  const { name, labelNum, boxId, isPrivate } = req.body;

  // Check if the user is active
  const user = await User.findOne({ _id: req.user._id, isActive: true });
  if (!user) {
    return res.status(400).json({ message: "User is inactive." });
  }

  if (!name || !labelNum || !boxId || isPrivate === undefined) {
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
  box.isPrivate = isPrivate;
  box.privateCode = isPrivate == "true" ? uid.randomUUID(6) : undefined;

  await box.save();

  return res.status(200).json({ message: "Box updated successfully." });
};

export const deleteBox = async (req, res) => {
  const { boxId } = req.params;

  // Check if the user is active
  const user = await User.findOne({ _id: req.user._id, isActive: true });
  if (!user) {
    return res.status(400).json({ message: "User is inactive." });
  }

  if (!boxId) {
    return res.status(400).json({ message: "Please provide an box ID" });
  }

  const box = await Box.findOneAndDelete({ user: req.user._id, _id: boxId });

  if (!box) {
    return res.status(400).json({ message: "Box not found" });
  }

  // Remove the box from the user's boxes
  req.user.boxes = req.user.boxes.filter(
    (boxId) => boxId.toString() !== box._id.toString(),
  );
  await req.user.save();

  return res.status(200).json({ message: "Box deleted successfully." });
};
export const changeBoxStatus = async (req, res) => {
  const { boxId, status } = req.body;

  console.log(req.body);

  // Check if the user is active
  const user = await User.findOne({ _id: req.user._id, isActive: true });
  if (!user) {
    return res.status(400).json({ message: "User is inactive." });
  }

  if (!boxId || status == undefined) {
    return res
      .status(400)
      .json({ message: "Please provide an box ID and a status" });
  }

  const box = await Box.findOne({ user: req.user._id, _id: boxId });

  if (!box) {
    return res.status(400).json({ message: "Box not found" });
  }

  // Change the status of the box
  box.isPrivate = status;
  box.privateCode = status ? uid.randomUUID(6) : undefined;
  await box.save();

  return res.status(200).json({ message: `Box is ${box.isPrivate ? "private" : "public"} now.` });
};

// Public stuff
export const showBoxById = async (req, res) => {
  const { boxId } = req.params;

  const box = await Box.findOne({ _id: boxId }).populate("user");

  // Check if the user is active
  if (!box.user.isActive) {
    return res.status(400).json({ message: "User is inactive." });
  }

  if (!box) {
    return res.status(400).json({ message: "No box found." });
  }

  const sortedItems = box.items.sort((a, b) => b.createdAt - a.createdAt);
  box.items = sortedItems;

  return res.status(200).json({ ...box._doc });
};

export const sendContactMessage = async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res
      .status(400)
      .json({ message: "Please provide a name, email, and message" });
  }

  // send the email
  try {
    // Send the email
    await transporter.sendMail({
      from: `"${process.env.SITE_NAME}" <${process.env.SMTP_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `Hello Elias! New message from ${name}`,
      text: `${name} wants to contact you.`,
      html: `

      <h1>Hello Elias!</h1>
      <h3>This message is from ${process.env.BASE_URL}</h3>
      <p>
      <b>Name:</b> ${name} <br />
      <b>Email:</b> ${email} <br />
      <b>Message:</b> ${message}
      </p>`,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Email address rejected because domain not found." });
  }

  return res.status(200).json({ message: "Message sent successfully." });
};

export const getBoxItems = async (req, res) => {
  const { boxId } = req.params;
  const { privateCode } = req.query;

  const query = { _id: boxId };

  const box = await Box.findOne(query).populate("user");

  // Check if the user is active
  if (!box.user.isActive) {
    return res.status(400).json({ message: "User is inactive." });
  }

  if (!box) {
    return res.status(400).json({ message: "No box found." });
  }

  if (box.isPrivate) {
    if (privateCode !== "" && privateCode !== box.privateCode.toString()) {
      return res
        .status(400)
        .json({ message: "Please enter the right private code." });
    } else if (privateCode === "") {
      return res.status(400).json({ message: "Box is private." });
    }
  }

  const sortedItems = box.items.sort((a, b) => b.createdAt - a.createdAt);
  box.items = sortedItems;

  return res.status(200).json([...box.items]);
};

export const getBoxItem = async (req, res) => {};

// Items
export const createItem = async (req, res) => {
  // Check if the user is active
  const user = await User.findOne({ _id: req.user._id, isActive: true });
  if (!user) {
    return res.status(400).json({ message: "User is inactive." });
  }

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
    mediaType = media.mimetype;
    // if the file mediaType is not an image or an audio file, return an error
    if (
      mediaType !== "image/png" &&
      mediaType !== "image/jpg" &&
      mediaType !== "image/jpeg" &&
      mediaType !== "audio/mpeg" &&
      mediaType !== "audio/wav"
    ) {
      return res.status(400).json({ message: "Please provide a valid file" });
    }
    mediaType = mediaType.split("/")[0];
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

  if (description === "" && !media && mediaPath === "") {
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
      mediaType !== "audio/mpeg" &&
      mediaType !== "audio/wav"
    ) {
      return res.status(400).json({ message: "Please provide a valid file" });
    }
    mediaType = mediaType.split("/")[0];
  }

  const box = await Box.findOne({
    user: req.user._id,
    "items._id": itemId,
  }).populate("user");

  // Check if the user is active
  if (!box.user.isActive) {
    return res.status(400).json({ message: "User is inactive." });
  }

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

  const box = await Box.findOne({
    user: req.user._id,
    "items._id": itemId,
  }).populate("user");

  // Check if the user is active
  if (!box.user.isActive) {
    return res.status(400).json({ message: "User is inactive." });
  }

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
  changeBoxStatus,

  // Public stuff
  showBoxById,
  sendContactMessage,
  getBoxItems,
  getBoxItem,

  // Items
  createItem,
  updateItem,
  deleteItem,
};
