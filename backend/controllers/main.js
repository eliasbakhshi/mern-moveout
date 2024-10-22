import Box from "../models/Box.js";
import DeletedBox from "../models/DeletedBox.js";
import { validationResult } from "express-validator";
import fs, { exists } from "fs";
import path from "path";
import transporter from "../config/nodemailer.js";
import ShortUniqueId from "short-unique-id";
import User from "../models/User.js";

const uid = new ShortUniqueId({ length: 6, dictionary: "number" });

const __dirname = path.resolve();

export const home = (req, res) => {
  return res
    .status(200)
    .json({ message: `Welcome to the ${process.env.SITE_NAME} API` });
};

export const getBoxes = async (req, res) => {
  // Check if the user is active
  const user = await User.findOne({ _id: req.user._id, isActive: true });
  if (!user) {
    return res.status(400).json({ message: "User is inactive." });
  }

  // Get the boxes
  const boxes = await Box.find({ user: req.user._id }).sort({
    createdAt: -1,
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

  const { name, labelNum, isPrivate, type } = req.body;
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
    type,
  });

  const newBox = await box.save();

  // Add new box to the user's boxes
  req.user.boxes.push(newBox._id);
  await req.user.save();

  return res.status(201).json({ id: newBox._id, message: "Box created." });
};

export const updateBox = async (req, res) => {
  const { name, labelNum, boxId, isPrivate, type } = req.body;

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
  box.type = type;

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

  const box = await Box.findOne({ user: req.user._id, _id: boxId });

  if (!box) {
    return res.status(400).json({ message: "Box not found" });
  }

  // Move the box to DeletedBox collection
  box.deletedAt = Date.now();
  box.items.forEach((item) => {
    if (item.mediaPath) {
      item.mediaPath = item.mediaPath.replace(
        process.env.UPLOADS_PATH,
        process.env.DELETED_UPLOADS_PATH,
      );
    }
  });
  await DeletedBox.create(box.toObject());
  await box.deleteOne();

  try {
    // Remove all media files that have the user ID as the first part of the filename
    const mediaFiles = fs.readdirSync(
      path.join(__dirname, process.env.UPLOADS_PATH),
    );
    mediaFiles.forEach((file) => {
      const [fileUserId] = file.split("-");
      if (fileUserId === user._id.toString()) {
        const deletedPath = path.join(
          __dirname,
          process.env.DELETED_UPLOADS_PATH,
          file,
        );
        fs.renameSync(
          path.join(__dirname, process.env.UPLOADS_PATH, file),
          deletedPath,
        );
      }
    });
  } catch (error) {
    console.log(error);
  }

  return res.status(200).json({ message: "Box deleted successfully." });
};

export const changeBoxStatus = async (req, res) => {
  const { boxId, status } = req.body;

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

  return res
    .status(200)
    .json({ message: `Box is ${box.isPrivate ? "private" : "public"} now.` });
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

  // Remove the items that are deleted
  box.items = box.items.filter((item) => !item.deletedAt);

  const sortedItems = box.items.sort((a, b) => b.createdAt - a.createdAt);
  box.items = sortedItems;
  // TODO: This should return items in the future for boxDetails page
  return res.status(200).json(box);
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
  const { boxId, description, value, type } = req.body;
  const media = req.file;
  let mediaType = undefined,
    mediaPath = undefined;

  // Return the errors if there are any
  const err = validationResult(req);
  if (!err.isEmpty()) {
    return res.status(422).json({ message: err.array()[0].msg });
  }

  if (description === "" && value === "undefined" && type === "insurance") {
    return res
      .status(400)
      .json({ message: "Please give a description and value." });
  }

  // Validate and convert the value field
  let numericValue = undefined;
  if (value !== "undefined" && value !== "") {
    numericValue = Number(value);
    if (isNaN(numericValue)) {
      return res.status(400).json({ message: "Invalid value provided" });
    }
  }

  if (description === "" && !media && type === "standard") {
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
    value: numericValue,
  });

  await theBox.save();

  return res.status(201).json({ message: "Item added to the box" });
};

export const updateItem = async (req, res) => {
  const { itemId, description, mediaPath, value, type } = req.body;
  const media = req.file;
  let mediaType = undefined,
    newMediaPath = undefined;

  // Return the errors if there are any
  const err = validationResult(req);
  if (!err.isEmpty()) {
    return res.status(422).json({ message: err.array()[0].msg });
  }

  console.log(req.body);

  if (
    (description === "" || description === "undefined") &&
    (value === "" || value === "undefined") &&
    type === "insurance"
  ) {
    return res
      .status(400)
      .json({ message: "Please give a description and value." });
  }

  // Validate and convert the value field
  let numericValue = undefined;
  if (value !== "undefined" && value !== "" && type === "insurance") {
    numericValue = Number(value);
    if (isNaN(numericValue)) {
      return res.status(400).json({ message: "Invalid value provided" });
    }
  }

  if (
    ((description === "" || description === "undefined") &&
      !media &&
      mediaPath === "",
    type === "standard")
  ) {
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
      item.value = numericValue;
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

  box.items = box.items.filter(async (item) => {
    if (item._id.toString() === itemId) {
      if (item.mediaPath) {
        // remove the media in the uploads folder
        // fs.unlinkSync(path.join(__dirname, item.mediaPath));
      }

      // Check if there is any box with the same box ID in the DeletedBox collection
      // const deletedBox = await DeletedBox.findOne({ box: box._id });
      // if (deletedBox) {
      //   deletedBox.items.push(item);
      //   await deletedBox.save();
      // } else {
      //   const newDeletedBox = new DeletedBox({
      //     box: box._id,
      //     items: [item],
      //   });
      //   await newDeletedBox.save();
      // }

      //   If there is, move the item from the box to the DeletedBox collection
      // If there is not, create a new DeletedBox collection with the same box ID and move the item to the DeletedBox collection
      // Move the media file to the deleted folder

      // soft delete the item
      item.deletedAt = Date.now();
      return item;
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
