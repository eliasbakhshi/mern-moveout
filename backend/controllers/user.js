import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { validationResult } from "express-validator";
import createSetToken from "../middlewares/createSetToken.js";
import transporter from "../config/nodemailer.js";
import crypto from "crypto";
import fs from "fs";
import path from "path";

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
  });
  // Get the email template
  let emailTemplate = fs.readFileSync(
    path.resolve(".") + "/backend/views/template-email-verification.html",
    "utf8",
  );
  emailTemplate = emailTemplate.replace(
    "**email_link**",
    `${process.env.BASE_URL}/verify-email/${emailVerificationToken}`,
  );
  emailTemplate = emailTemplate.replace("**name**", name);
  // Send the email
  await transporter.sendMail({
    from: `"${process.env.SITE_NAME}" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Please verify your email.",
    text: `Thank you ${name} for signing up! We're excited to have you on board.`,
    html: emailTemplate,
  });

  return res.status(201).json({ message: "User created successfully." });
};

export const login = async (req, res, next) => {
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
    name: user.name,
    email: user.email,
    role: user.role,
    mediaPath: user.mediaPath,
  });
};

export const logout = (req, res, next) => {
  // Clear the cookie
  res.clearCookie("JWTMERNMoveOut");
  return res.status(200).json({ message: "Logged out." });
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
  });
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
    "**email_link**",
    `${process.env.BASE_URL}/verify-email/${emailVerificationToken}`,
  );
  emailTemplate = emailTemplate.replace("**name**", user.name);
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
    "**email_link**",
    `${process.env.BASE_URL}/reset-password/${resetPasswordToken}`,
  );
  emailTemplate = emailTemplate.replace("**name**", user.name);
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

export default {
  register,
  login,
  logout,
  verifyEmail,
  sendVerificationEmail,
  getCurrentUser,
  updateCurrentUser,
  sendResetPasswordEmail,
  verifyTokenResetPassword,
  updateUserPasswordById,
};
