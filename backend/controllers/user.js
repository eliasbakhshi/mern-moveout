import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { validationResult } from "express-validator";
import createSetToken from "../middlewares/createSetToken.js";
import transporter from "../config/nodemailer.js";
import crypto from "crypto";
import fs from "fs";
import path from "path";

const secret = process.env.JWT_KEY;

export const register = async (req, res) => {
  const { name, email, password } = req.body;
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
  const tokenExpiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days
  // Create a new user
  const user = await User.create({
    name,
    email,
    password: hashed,
    emailVerificationToken,
    tokenExpiresAt,
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
  const { email, password, remember } = req.body;
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
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  });
};

export const logout = (req, res, next) => {
  // Clear the cookie
  res.clearCookie("JWTMERNMoveOut");
  return res.status(200).json({ message: "Logged out." });
};

export const getAllUsers = async (req, res) => {
  const users = await User.find({});
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
  const { name, email, password, role = "user" } = req.body;
  // Find the user
  const user = await User.findById({ _id: req.user._id });

  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }
  // Update the user
  user.name = name || user.name;
  user.email = email || user.email;
  user.password = password ? await bcrypt.hash(password, 10) : user.password;
  user.role = role || user.role;
  const updatedUser = await user.save();

  return res.status(200).json({
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    role: updatedUser.role,
  });
};

export const verifyEmail = async (req, res) => {
  const { token } = req.query;
  if (!token) {
    return res.status(400).json({ message: "Token is required." });
  }
  // Find the user
  const user = await User.findOne({
    emailVerificationToken: token,
    tokenExpiresAt: { $gt: Date.now() },
  });
  if (!user) {
    return res.status(400).json({ message: "Invalid token or token expired." });
  }
  // Update the user and set emailVerified to true
  user.emailVerificationToken = undefined;
  user.tokenExpiresAt = undefined;
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

  const { email } = req.body;
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
  const tokenExpiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days
  // Update the user
  user.emailVerificationToken = emailVerificationToken;
  user.tokenExpiresAt = tokenExpiresAt;
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

export const deleteUser = async (req, res) => {
  const userId = req.params.userId;
  // Find the user and delete it
  const user = await User.findOneAndDelete({ _id: userId });

  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }
  return res.status(200).json({ message: "User has been deleted." });
};

export const getUserById = async (req, res) => {
  const userId = req.params.userId;

  // Find the user but exclude the password, createdAt, and updatedAt fields
  const user = await User.findOne({ _id: userId }).select(
    "-password -createAt -updatedAt",
  );

  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }
  return res.status(200).json(user);
};

export const updateUserById = async (req, res) => {
  const userId = req.params.userId;
  // Find the user
  const user = await User.findOne({ _id: userId });

  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  const { name, email, role } = req.body;
  // Update the user
  user.name = name || user.name;
  user.email = email || user.email;
  user.role = role || user.role;

  const updatedUser = await user.save();

  return res.status(200).json({
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    role: updatedUser.role,
  });
};

export default {
  register,
  login,
  logout,
  verifyEmail,
  sendVerificationEmail,
  getAllUsers,
  getCurrentUser,
  updateCurrentUser,
  deleteUser,
  getUserById,
  updateUserById,
};
