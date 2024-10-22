import User from "../models/User.js";
import Box from "../models/Box.js";
import DeletedUser from "../models/DeletedUser.js";
import DeletedBox from "../models/DeletedBox.js";
import bcrypt from "bcryptjs";
import { validationResult } from "express-validator";
import createSetToken from "../middlewares/createSetToken.js";
import transporter from "../config/nodemailer.js";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import ShortUniqueId from "short-unique-id";

const __dirname = path.resolve();

export const register = async (req, res) => {
  let { name, email, password } = req.body;
  email = email.trim().toLowerCase();
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Please fill in all the fields." });
  }

  // Check if the email already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: "Email already exists." });
  }
  // Create hashed password and email token
  const hashed = await bcrypt.hash(password, 10);
  const emailToken = crypto.randomBytes(32).toString("hex");
  const emailVerificationToken = crypto
    .createHash("sha256")
    .update(emailToken)
    .digest("hex");
  const emailVerificationTokenExpiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days
  // Create a new user
  const user = await User.create({
    name,
    email,
    password: hashed,
    emailVerificationToken,
    emailVerificationTokenExpiresAt,
    registeredWith: ["Email"],
  });
  // Get the email template
  let emailTemplate = fs.readFileSync(
    path.resolve(".") + "/backend/views/template-email-verification.html",
    "utf8",
  );
  emailTemplate = emailTemplate.replace(/(\*\*name\*\*)/g, name);
  emailTemplate = emailTemplate.replace(/(\*\*button_text\*\*)/g, "Verify Me");
  emailTemplate = emailTemplate.replace(
    /(\*\*email_link\*\*)/g,
    `${process.env.BASE_URL}/verify-email/${emailVerificationToken}`,
  );

  try {
    // Send the email
    await transporter.sendMail({
      from: `"${process.env.SITE_NAME}" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Please verify your email.",
      text: `Thank you ${name} for signing up! We're excited to have you on board.`,
      html: emailTemplate,
    });
  } catch (error) {
    // Delete the user if the email is not sent
    await user.deleteOne();
    return res
      .status(500)
      .json({ message: "Email address rejected because domain not found." });
  }

  return res.status(201).json({ message: "User created successfully." });
};

export const registerWithGoogle = async (req, res) => {
  let { name, email, picture: mediaPath } = req.body;
  email = email.trim().toLowerCase();
  if (!name || !email || !mediaPath) {
    return res.status(400).json({ message: "Please fill in all the fields." });
  }

  // Check if the email already exists
  const userExists = await User.findOne({ email });

  // // Check if user has registered with Gmail and if yes, login the user
  // if (userExists && userExists.registeredWith.includes("Google")) {
  //   createSetToken(res, userExists._id);
  //   return res.status(200).json({ message: "User logged in successfully." });
  // }

  if (userExists) {
    return res.status(400).json({ message: "Email already exists." });
  }

  // Create a new user
  const user = await User.create({
    name,
    email,
    mediaPath,
    verified: true,
    registeredWith: ["Google"],
  });
  await user.save();

  // Get the email template
  let emailTemplate = fs.readFileSync(
    path.resolve(".") + "/backend/views/template-welcome-registration.html",
    "utf8",
  );
  emailTemplate = emailTemplate.replace(
    /(\*\*website_url\*\*)/g,
    `${process.env.BASE_URL}`,
  );
  emailTemplate = emailTemplate.replace(/(\*\*name\*\*)/g, user.name);

  try {
    // Send the email
    await transporter.sendMail({
      from: `"${process.env.SITE_NAME}" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `Welcome to ${process.env.SITE_NAME}`,
      text: `Thank you ${name} for signing up! We're excited to have you on board.`,
      html: emailTemplate,
    });
  } catch (error) {
    // Delete the user if the email is not sent
    await user.deleteOne();
    return res
      .status(500)
      .json({ message: "Email address rejected because domain not found." });
  }

  // Create and set a token
  createSetToken(res, user._id);
  return res.status(200).json({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    mediaPath: user.mediaPath,
    isActive: user.isActive,
  });

  // return res.status(201).json({ message: "Your account has been created successfully 🎉" });
};

export const login = async (req, res) => {
  let { email, password, remember } = req.body;
  email = email.trim().toLowerCase();
  if (!email || !password) {
    return res.status(400).json({ message: "Please fill in all the fields." });
  }
  // Validate the email and password
  const err = validationResult(req);
  if (!err.isEmpty()) {
    return res.status(422).json({ message: err.array()[0].msg });
  }
  // Check if the user exists
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: "User not found." });
  }

  // Show message if user has registered with another method
  if (!user.registeredWith.includes("Email")) {
    const registeredWith = user.registeredWith.join(", ");
    return res.status(400).json({
      message: `You have registered with ${registeredWith}. Please login with ${registeredWith}.`,
    });
  }

  // Check if the email is verified
  if (!user.emailVerified) {
    return res.status(400).json({ message: "Please verify your email." });
  }

  // Check if the password is correct
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(400).json({ message: "Invalid email or password." });
  }
  // Create and set a token
  createSetToken(res, user._id, remember);
  return res.status(200).json({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    mediaPath: user.mediaPath,
    isActive: user.isActive,
  });
};

export const loginWithGoogle = async (req, res) => {
  let { email, name, picture } = req.body;
  email = email.trim().toLowerCase();
  if (!email || !name) {
    return res
      .status(400)
      .json({ message: "Please provide a name and an email" });
  }
  // Validate the email and password
  const err = validationResult(req);
  if (!err.isEmpty()) {
    return res.status(422).json({ message: err.array()[0].msg });
  }
  // Check if the user exists
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({
      message: "You need to register first to be able to login with Google.",
    });
  }

  // Show message if user has registered with another method
  if (
    !user.registeredWith.includes("Email") &&
    !user.registeredWith.includes("Google")
  ) {
    const registeredWith = user.registeredWith.join(", ");
    return res.status(400).json({
      message: `You have registered with ${registeredWith}. Please login with ${registeredWith}.`,
    });
  }

  // Verify the user
  user.emailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationTokenExpiresAt = undefined;
  user.name = user.name || name;
  user.mediaPath = user.mediaPath || picture;
  await user.save();

  // Create and set a token
  createSetToken(res, user._id);
  return res.status(200).json({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    mediaPath: user.mediaPath,
    isActive: user.isActive,
  });
};

export const logout = (req, res) => {
  // Clear the cookie
  res.clearCookie("JWTMERNMoveOut");
  return res.status(200).json({ message: "Logged out." });
};

export const verifyEmail = async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ message: "Token is required." });
  }
  // Find the user
  const user = await User.findOne({
    emailVerificationToken: token,
    emailVerificationTokenExpiresAt: { $gt: Date.now() },
  });
  if (!user) {
    return res.status(400).json({ message: "Invalid token or token expired." });
  }
  // Update the user and set emailVerified to true
  user.emailVerificationToken = undefined;
  user.emailVerificationTokenExpiresAt = undefined;
  user.emailVerified = true;
  await user.save();
  return res.status(200).json({ message: "Email verified." });
};

export const sendVerificationEmail = async (req, res) => {
  // Validate the email
  const err = validationResult(req);
  if (!err.isEmpty()) {
    return res.status(422).json({ message: err.array()[0].msg });
  }

  let { email } = req.body;
  email = email.trim().toLowerCase();
  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }
  // Find the user
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: "Email not found." });
  }
  // Check if the email is verified
  if (user.emailVerified) {
    return res.status(400).json({ message: "Email already verified." });
  }
  // Create a new email token
  const emailToken = crypto.randomBytes(32).toString("hex");
  const emailVerificationToken = crypto
    .createHash("sha256")
    .update(emailToken)
    .digest("hex");
  // Update the user
  user.emailVerificationToken = emailVerificationToken;
  user.emailVerificationTokenExpiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days
  await user.save();
  // Get the email template
  let emailTemplate = fs.readFileSync(
    path.resolve(".") + "/backend/views/template-email-verification.html",
    "utf8",
  );
  emailTemplate = emailTemplate.replace(
    /(\*\*email_link\*\*)/g,
    `${process.env.BASE_URL}/verify-email/${emailVerificationToken}`,
  );
  emailTemplate = emailTemplate.replace(/(\*\*name\*\*)/g, user.name);
  // Send the email
  await transporter.sendMail({
    from: `"${process.env.SITE_NAME}" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Please verify your email.",
    text: `Thank you ${user.name} for signing up! We're excited to have you on board.`,
    html: emailTemplate,
  });
  return res.status(200).json({
    message: "Verification sent successfully. Please check your email.",
  });
};

export const sendResetPasswordEmail = async (req, res) => {
  // Validate the email
  const err = validationResult(req);
  if (!err.isEmpty()) {
    return res.status(422).json({ message: err.array()[0].msg });
  }

  let { email } = req.body;
  email = email.trim().toLowerCase();
  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }
  // Find the user
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: "Email not found." });
  }

  // Create a new email token
  const emailToken = crypto.randomBytes(32).toString("hex");
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(emailToken)
    .digest("hex");
  // Update the user
  user.resetPasswordToken = resetPasswordToken;
  user.resetPasswordTokenExpiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days;
  await user.save();
  // Get the email template
  let emailTemplate = fs.readFileSync(
    path.resolve(".") + "/backend/views/template-email-reset-password.html",
    "utf8",
  );
  emailTemplate = emailTemplate.replace(
    /(\*\*email_link\*\*)/g,
    `${process.env.BASE_URL}/reset-password/${resetPasswordToken}`,
  );
  emailTemplate = emailTemplate.replace(/(\*\*name\*\*)/g, user.name);
  // Send the email
  await transporter.sendMail({
    from: `"${process.env.SITE_NAME}" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Resetting your password.",
    text: `Hi ${user.name}! You can click on the link below to reset your password.`,
    html: emailTemplate,
  });
  return res.status(200).json({
    message: "Instruction email sent successfully. Please check your email.",
  });
};

export const verifyTokenResetPassword = async (req, res) => {
  const { token } = req.params;

  if (!token) {
    return res.status(400).json({ message: "Token is required." });
  }
  // Find the user
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordTokenExpiresAt: { $gt: Date.now() },
  });
  if (!user) {
    return res.status(400).json({ message: "Invalid token or token expired." });
  }

  return res.status(200).json({ message: "Token verified.", userId: user._id });
};

export const updateUserPasswordById = async (req, res) => {
  const { password, userId } = req.body;
  // Return the errors if there are any
  const err = validationResult(req);
  if (!err.isEmpty()) {
    return res.status(422).json({ message: err.array()[0].msg });
  }

  // Find the user
  const user = await User.findOne({ _id: userId });
  if (!user) {
    return res.status(400).json({ message: "User not found." });
  }
  // Update the user and set emailVerified to true
  user.password = await bcrypt.hash(password, 10);
  user.resetPasswordToken = undefined;
  user.resetPasswordTokenExpiresAt = undefined;
  await user.save();

  return res.status(200).json({ message: "Password has been updated." });
};

export const getUsers = async (req, res) => {
  // Check if the user is an admin
  const isAdmin = await User.findById({ _id: req.user._id, role: "admin" });

  if (!isAdmin) {
    return res.status(404).json({ message: "User not found." });
  }

  // Find all users
  const users = await User.find(
    { _id: { $ne: req.user._id } },
    { password: 0 },
  );
  if (!users) {
    return res.status(404).json({ message: "No users found." });
  }

  // get the data usage of each user
  for (const user of users) {
    const boxes = await Box.find({ user: user._id });
    let dataUsage = 0;
    for (const box of boxes) {
      for (const item of box.items) {
        if (item.mediaPath && item.deletedAt === undefined) {
          const stats = fs.statSync(path.join(__dirname, item.mediaPath));
          dataUsage += stats.size;
        }
      }
    }
    user.dataUsage = dataUsage;
    await user.save(); // Save the user with the updated dataUsage
  }

  return res.status(200).json(users);
};

export const getDeletedUsers = async (req, res) => {
  // Check if the user is an admin
  const isAdmin = await User.findById({ _id: req.user._id, role: "admin" });

  if (!isAdmin) {
    return res.status(404).json({ message: "User not found." });
  }

  // Find all users
  const users = await DeletedUser.find({}, { password: 0 });
  if (!users) {
    return res.status(404).json({ message: "No users found." });
  }

  return res.status(200).json(users);
};

export const getCurrentUser = async (req, res) => {
  const users = await User.findById({ _id: req.user._id });

  if (!users) {
    return res.status(404).json({ message: "User not found." });
  }
  return res.status(200).json(users);
};

export const updateCurrentUser = async (req, res) => {
  let { name, email, password, mediaPath } = req.body;
  email = email.trim().toLowerCase();
  const media = req.file;
  let mediaType = undefined,
    newMediaPath = undefined;

  // Return the errors if there are any
  const err = validationResult(req);
  if (!err.isEmpty()) {
    return res.status(422).json({ message: err.array()[0].msg });
  }

  // Find the user
  const user = await User.findById({ _id: req.user._id });

  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  // Check if the other users has the email
  const otherUser = await User.findOne({ _id: { $ne: req.user._id }, email });
  if (otherUser) {
    return res.status(400).json({ message: "Email already exists." });
  }

  // if there is a file, check if it is an image or an audio file
  if (media) {
    // get the file path
    newMediaPath = `${process.env.UPLOADS_PATH}/${media.filename}`;
    // get the file mediaType
    mediaType = media.mimetype;
    // if the file mediaType is not an image or an audio file, return an error
    if (
      mediaType !== "image/png" &&
      mediaType !== "image/jpg" &&
      mediaType !== "image/jpeg"
    ) {
      return res
        .status(400)
        .json({ message: "Valid files are .jpg,.jpeg,.png" });
    }
    mediaType = mediaType.split("/")[0];
  }

  try {
    if (user.mediaPath && newMediaPath) {
      // if there is a new media, remove the media in the uploads folder
      fs.unlinkSync(path.join(__dirname, user.mediaPath));
    } else if (user.mediaPath && !mediaPath) {
      // if there is no media, remove the media in the uploads folder
      fs.unlinkSync(path.join(__dirname, user.mediaPath));
    }
  } catch (error) {
    console.log(error);
  }
  if (newMediaPath) {
    // if there is a new media, update the media path and media type
    user.mediaPath = newMediaPath;
  } else if (!mediaPath) {
    // if there is no media , remove the media path and media type
    user.mediaPath = undefined;
  }

  // Update the user
  user.name = name || user.name;
  user.email = email || user.email;
  user.password = password ? await bcrypt.hash(password, 10) : user.password;

  const updatedUser = await user.save();

  createSetToken(res, user._id);

  return res.status(200).json({
    name: updatedUser.name,
    email: updatedUser.email,
    role: updatedUser.role,
    mediaPath: updatedUser.mediaPath,
    isActive: user.isActive,
  });
};

export const createUser = async (req, res) => {
  const uid = new ShortUniqueId({ length: 6 });
  let { name, email, password } = req.body;
  email = email.trim().toLowerCase();
  if (!name || !email) {
    return res.status(400).json({ message: "Please fill in all the fields." });
  }

  // Check if the user is an admin
  const isAdmin = await User.findById({ _id: req.user._id, role: "admin" });

  if (!isAdmin) {
    return res
      .status(404)
      .json({ message: "Admin can just do this operation." });
  }

  // Check if the email already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: "Email already exists." });
  }

  if (password === "") {
    password = uid.randomUUID(6);
  }
  // Create hashed password and email token
  const hashed = await bcrypt.hash(password, 10);
  // Create a new user
  const user = await User.create({
    name,
    email,
    password: hashed,
    registeredWith: ["Email"],
    role: "user",
    isActive: true,
    emailVerified: true,
  });
  // Get the email template
  let emailTemplate = fs.readFileSync(
    path.resolve(".") +
      "/backend/views/template-welcome-registration-admin.html",
    "utf8",
  );

  emailTemplate = emailTemplate.replace(
    /(\*\*website_name\*\*)/g,
    `${process.env.SITE_NAME}`,
  );
  emailTemplate = emailTemplate.replace(
    /(\*\*login_url\*\*)/g,
    `${process.env.BASE_URL}/login`,
  );
  emailTemplate = emailTemplate.replace(/(\*\*name\*\*)/g, name);
  emailTemplate = emailTemplate.replace(/(\*\*email\*\*)/g, email);
  emailTemplate = emailTemplate.replace(/(\*\*password\*\*)/g, password);

  try {
    // Send the email
    await transporter.sendMail({
      from: `"${process.env.SITE_NAME}" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `Welcome to ${process.env.SITE_NAME}`,
      text: `Hi ${name}. Admin has registered you in the for signing up! We're excited to have you on board.`,
      html: emailTemplate,
    });
  } catch (error) {
    // Delete the user if the email is not sent
    await user.deleteOne();
    return res
      .status(500)
      .json({ message: "Email address rejected because domain not found." });
  }

  return res.status(201).json({ message: "User created successfully.", user });
};

export const editUser = async (req, res) => {
  // Check if the user is an admin
  const isAdmin = await User.findById({ _id: req.user._id, role: "admin" });
  if (!isAdmin) {
    return res
      .status(404)
      .json({ message: "Admin can just do this operation." });
  }

  console.log("req.body", req.body);
  let { userId, name, email, password, isActive } = req.body;
  email = email.trim().toLowerCase();
  if (!name || !email) {
    return res.status(400).json({ message: "Please give name and email." });
  }

  // Check if the user user has the email if admin wants to change the email
  const userExists = await User.findOne({ _id: { $ne: userId }, email });
  if (userExists) {
    return res.status(400).json({ message: "Email already exists." });
  }

  if (password !== "") {
    // Create hashed password and email token
    password = await bcrypt.hash(password, 10);
  }

  // Find the user
  const user = await User.findById({ _id: userId });

  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  // Update the user
  user.name = name || user.name;
  user.email = email || user.email;
  user.password = password || user.password;
  user.isActive = isActive ? true : false;

  await user.save();

  return res.status(201).json({ message: "User updated successfully." });
};

export const deleteUser = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "Please provide a userId." });
  }

  // Check if the user is an admin
  const isAdmin = await User.findById({ _id: req.user._id, role: "admin" });

  if (!isAdmin) {
    return res
      .status(404)
      .json({ message: "Admin can just do this operation." });
  }

  // Find the user
  const user = await User.findById({ _id: userId });

  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

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

  // Move user to DeletedUser model and delete from User model
  if (user.emailDeleteToken && user.emailDeleteTokenExpiresAt) {
    user.emailDeleteToken = undefined;
    user.emailDeleteTokenExpiresAt = undefined;
  }
  user.deletedAt = Date.now();
  await DeletedUser.create(user.toObject());
  await user.deleteOne();

  // Move user's boxes to DeletedBox collection
  const userBoxes = await Box.find({ user: req.user._id });
  for (const box of userBoxes) {
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
  }

  return res.status(200).json({
    message: "User has been deleted.",
  });
};

export const recoverUser = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "Please provide a userId." });
  }

  // Check if the user is an admin
  const isAdmin = await User.findById({ _id: req.user._id, role: "admin" });

  if (!isAdmin) {
    return res
      .status(404)
      .json({ message: "Admin can just do this operation." });
  }

  // Find the user
  const deletedUser = await DeletedUser.findById({ _id: userId });

  if (!deletedUser) {
    return res.status(404).json({ message: "User not found." });
  }

  try {
    // Move all media files that have the user ID from the deleted-uploads to uploads as the first part of the filename
    const mediaFiles = fs.readdirSync(
      path.join(__dirname, process.env.DELETED_UPLOADS_PATH),
    );
    mediaFiles.forEach((file) => {
      const [fileUserId] = file.split("-");
      if (fileUserId === deletedUser._id.toString()) {
        fs.renameSync(
          path.join(__dirname, process.env.DELETED_UPLOADS_PATH, file),
          path.join(__dirname, process.env.UPLOADS_PATH, file), // Move the file back to the uploads folder
        );
      }
    });
  } catch (error) {
    console.log(error);
  }
  deleteUser.deletedAt = undefined;

  // Move back user from deletedUser model to User model
  await User.create(deletedUser.toObject());
  await deletedUser.deleteOne();

  // Move user's DeletedBox to Boxes collection
  const deletedBoxes = await DeletedBox.find({ user: req.user._id });
  for (const deletedBox of deletedBoxes) {
    deletedBox.deletedAt = undefined;
    deletedBox.items.forEach((item) => {
      if (item.mediaPath) {
        item.mediaPath = item.mediaPath.replace(
          process.env.DELETED_UPLOADS_PATH,
          process.env.UPLOADS_PATH,
        );
      }
    });
    await Box.create(deletedBox.toObject());
    await deletedBox.deleteOne();
  }

  return res.status(200).json({
    message: "User has been recovered.",
  });
};

export const changeUserStatus = async (req, res) => {
  const { userId, isActive } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "Please provide a userId." });
  }

  // Check if the user is an admin
  const isAdmin = await User.findById({ _id: req.user._id, role: "admin" });

  if (!isAdmin) {
    return res
      .status(404)
      .json({ message: "Admin can just do this operation." });
  }

  // Find the user
  const user = await User.findById({ _id: userId });

  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  // Update the user
  user.isActive = isActive ? true : false;
  await user.save();

  return res.status(201).json({ message: "User status updated successfully." });
};

export const deleteCurrentUser = async (req, res) => {
  const { token } = req.query;

  // Find the user
  const user = await User.findOne({
    _id: req.user._id,
    emailDeleteToken: token,
    emailDeleteTokenExpiresAt: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  try {
    // Remove all media files that have the user ID as the first part of the filename
    const mediaFiles = fs.readdirSync(
      path.join(__dirname, process.env.UPLOADS_PATH),
    );
    mediaFiles.forEach((file) => {
      const [fileUserId] = file.split("-");
      if (fileUserId === req.user._id.toString()) {
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

  // Move user to DeletedUser model and delete from User model
  if (user.emailDeleteToken && user.emailDeleteTokenExpiresAt) {
    user.emailDeleteToken = undefined;
    user.emailDeleteTokenExpiresAt = undefined;
  }
  user.deletedAt = Date.now();
  await DeletedUser.create(user.toObject());
  await user.deleteOne();

  // Move user's boxes to DeletedBox collection
  const userBoxes = await Box.find({ user: req.user._id });
  for (const box of userBoxes) {
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
  }

  // Clear the cookie
  res.clearCookie("JWTMERNMoveOut");

  return res.status(200).json({
    message:
      "Your account has been successfully deleted. We're sorry to see you go.",
  });
};

export const getNamesAndEmails = async (req, res) => {
  // Check if the user is active
  const user = await User.findOne({ _id: req.user._id, isActive: true });
  if (!user) {
    return res.status(400).json({ message: "User is inactive." });
  }

  // Find the email and name of all users
  const users = await User.find(
    { email: { $ne: req.user.email } },
    { email: 1, name: 1, _id: 0 },
  );

  if (!users) {
    return res.status(404).json({ message: "No email and name exists" });
  }

  return res.status(200).json(users);
};

export const shareBox = async (req, res) => {
  const { boxId, email } = req.body;
  const uid = new ShortUniqueId({ length: 6, dictionary: "number" });

  // show the error if there is any
  if (!boxId || !email) {
    return res.status(400).json({ message: "Box ID and email are required." });
  }
  const err = validationResult(req);
  if (!err.isEmpty()) {
    return res.status(422).json({ message: err.array()[0].msg });
  }

  // Find the user
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: "User not found." });
  }

  // Check if the user is active
  if (!user.isActive) {
    return res.status(400).json({ message: "User is inactive." });
  }

  // Find the box
  const box = await Box.findOne({ _id: boxId });
  if (!box) {
    return res.status(400).json({ message: "Box not found." });
  }

  // duplicate the box
  const newBox = await Box.create({
    name: box.name,
    description: box.description,
    items: box.items,
    labelNum: box.labelNum,
    isPrivate: box.isPrivate,
    privateCode: box.privateCode ? uid.randomUUID(6) : undefined,
    user: user._id,
  });

  // Add the box to the user's box list
  user.boxes.push(newBox._id);
  await user.save();

  // Get the email template for sharing a box
  let emailTemplate = fs.readFileSync(
    path.resolve(".") + "/backend/views/template-share-label-or-box.html",
    "utf8",
  );
  emailTemplate = emailTemplate.replace(
    /(\*\*email_link\*\*)/g,
    `${process.env.BASE_URL}/boxes/${newBox._id}/items`,
  );
  emailTemplate = emailTemplate.replace(/(\*\*name_from\*\*)/g, req.user.name);
  emailTemplate = emailTemplate.replace(/(\*\*name_to\*\*)/g, user.name);
  emailTemplate = emailTemplate.replace(/(\*\*shared_object\*\*)/g, "box");
  emailTemplate = emailTemplate.replace(/(\*\*privateCode\*\*)/g, ``);

  try {
    // Send the email
    await transporter.sendMail({
      from: `"${process.env.SITE_NAME}" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "A box has been shared with you.",
      text: `${user.name} has shared a box with you. You can click on the link below to view the box.`,
      html: emailTemplate,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Email address rejected because domain not found." });
  }

  return res.status(200).json({ message: "Box shared successfully." });
};

export const shareLabel = async (req, res) => {
  const { labelId, email } = req.body;
  const uid = new ShortUniqueId({ length: 6, dictionary: "number" });

  // show the error if there is any
  if (!labelId || !email) {
    return res.status(400).json({ message: "Box ID and email are required." });
  }
  const err = validationResult(req);
  if (!err.isEmpty()) {
    return res.status(422).json({ message: err.array()[0].msg });
  }

  // Find the label
  const label = await Box.findOne({ _id: labelId });

  if (!label) {
    return res.status(400).json({ message: "Label not found." });
  }

  // Find the user
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: "User not found." });
  }

  // Check if the user is active
  if (!user.isActive) {
    return res.status(400).json({ message: "User is inactive." });
  }

  // Get the email template for sharing a box
  let emailTemplate = fs.readFileSync(
    path.resolve(".") + "/backend/views/template-share-label-or-box.html",
    "utf8",
  );
  emailTemplate = emailTemplate.replace(
    /(\*\*email_link\*\*)/g,
    `${process.env.BASE_URL}/boxes/${labelId}`,
  );
  emailTemplate = emailTemplate.replace(/(\*\*name_from\*\*)/g, req.user.name);
  emailTemplate = emailTemplate.replace(/(\*\*name_to\*\*)/g, user.name);
  emailTemplate = emailTemplate.replace(/(\*\*shared_object\*\*)/g, "label");
  if (label.isPrivate) {
    emailTemplate = emailTemplate.replace(
      /(\*\*privateCode\*\*)/g,
      `<p>The private code is: <strong>${label.privateCode}</strong></p> `,
    );
  } else {
    emailTemplate = emailTemplate.replace(/(\*\*privateCode\*\*)/g, ``);
  }

  try {
    // Send the email
    await transporter.sendMail({
      from: `"${process.env.SITE_NAME}" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "A label has been shared with you.",
      text: `${user.name} has shared a label with you. You can click on the link below to view the label.`,
      html: emailTemplate,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Email address rejected because domain not found." });
  }
  return res.status(200).json({ message: "Label shared successfully." });
};

export const deactivateCurrentUser = async (req, res) => {
  // Find the user
  const user = await User.findOne({ _id: req.user._id });

  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  // Check if the user is active
  if (!user.isActive) {
    return res.status(400).json({ message: "User is inactive." });
  }

  // Deactivate the user
  user.isActive = false;
  await user.save();

  // Get the email template
  let emailTemplate = fs.readFileSync(
    path.resolve(".") + "/backend/views/template-deactive-reactive-user.html",
    "utf8",
  );
  emailTemplate = emailTemplate.replace(
    /(\*\*login_link\*\*)/g,
    `${process.env.BASE_URL}/login`,
  );
  emailTemplate = emailTemplate.replace(/(\*\*name\*\*)/g, user.name);

  try {
    // Send the email
    await transporter.sendMail({
      from: `"${process.env.SITE_NAME}" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: "Your account has been deactivated.",
      html: emailTemplate,
    });
  } catch (error) {
    // Delete the user if the email is not sent
    return res
      .status(500)
      .json({ message: "Email address rejected because domain not found." });
  }

  const { name, email, role, isActive, mediaPath } = user;
  return res.status(200).json({
    message: "User deactivated successfully.",
    user: { name, email, role, isActive, mediaPath },
  });
};

export const reactivateCurrentUser = async (req, res) => {
  // Find the user
  const user = await User.findOne({ _id: req.user._id });

  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  // Check if the user is inactive
  if (user.isActive) {
    return res.status(400).json({ message: "User is active." });
  }

  // Deactivate the user
  user.isActive = true;
  await user.save();

  const { name, email, role, isActive, mediaPath } = user;

  return res.status(200).json({
    message: "User reactivated successfully.",
    user: { name, email, role, isActive, mediaPath },
  });
};

export const sendDeleteEmail = async (req, res) => {
  // Find the user
  const user = await User.findOne({ _id: req.user._id });

  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  // Check if the user is active
  if (user.isActive) {
    return res.status(400).json({ message: "User is active." });
  }

  const emailToken = crypto.randomBytes(32).toString("hex");
  const emailDeleteToken = crypto
    .createHash("sha256")
    .update(emailToken)
    .digest("hex");
  const emailDeleteTokenExpiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days
  // update the user
  user.emailDeleteToken = emailDeleteToken;
  user.emailDeleteTokenExpiresAt = emailDeleteTokenExpiresAt;
  await user.save();
  // Get the email template
  let emailTemplate = fs.readFileSync(
    path.resolve(".") + "/backend/views/template-email-delete-user.html",
    "utf8",
  );
  emailTemplate = emailTemplate.replace(
    /(\*\*delete_link\*\*)/g,
    `${process.env.BASE_URL}/delete-account/${emailDeleteToken}`,
  );
  emailTemplate = emailTemplate.replace(/(\*\*name\*\*)/g, user.name);

  try {
    // Send the email
    await transporter.sendMail({
      from: `"${process.env.SITE_NAME}" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: "Verify Your Account Deletion Request",
      html: emailTemplate,
    });
  } catch (error) {
    // Delete the user if the email is not sent
    return res
      .status(500)
      .json({ message: "Email address rejected because domain not found." });
  }

  const { name, email, role, isActive, mediaPath } = user;

  return res.status(200).json({
    message: "Delete confirmation email sent successfully.",
    user: { name, email, role, isActive, mediaPath },
  });
};

export default {
  register,
  registerWithGoogle,
  login,
  loginWithGoogle,
  logout,
  verifyEmail,
  sendVerificationEmail,
  sendResetPasswordEmail,
  verifyTokenResetPassword,
  updateUserPasswordById,
  getUsers,
  getDeletedUsers,
  getCurrentUser,
  updateCurrentUser,
  createUser,
  editUser,
  deleteUser,
  recoverUser,
  changeUserStatus,
  deleteCurrentUser,
  getNamesAndEmails,
  shareBox,
  shareLabel,
  deactivateCurrentUser,
  reactivateCurrentUser,

  sendDeleteEmail,
};
