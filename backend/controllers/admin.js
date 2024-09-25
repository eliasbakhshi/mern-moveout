import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Box from "../models/Box.js";
import User from "../models/User.js";

const secret = process.env.JWT_KEY;

// export const addProduct = async (req, res) => {
//   const { name, description, imagePath, price, stock } = req.body;

//   // Check if the product already exists
//   const productExists = await Product.findOne({
//     name,
//     description,
//     imagePath,
//     price,
//     stock,
//     userId: req.user._id,
//   });
//   if (productExists) {
//     return res.status(400).json({ message: "Product already exists" });
//   }
//   const product = await Product.create({ name, description, price });
//   return res.status(201).json({ product });
// };

export const dashboard = async (req, res) => {
  return res.status(200).json({ message: "Welcome to the dashboard" });
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

export const getAllUsers = async (req, res) => {
  const users = await User.find({});
  return res.status(200).json(users);
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
  const userId = req.user._id;
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
  dashboard,
  deleteUser,
  getAllUsers,
  getUserById,
  updateUserById,
};
