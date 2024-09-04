import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { validationResult } from "express-validator";
import createSetToken from "../middlewares/createSetToken.js";

const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
var path = require("path");
const fs = require("node:fs");
const { validationResult } = require("express-validator");

/**
 * Create a transporter for sending emails
 */
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    // allow less secure apps to access the email account for localhost
    tls: {
        rejectUnauthorized: process.env.SMTP_PRODUCTION,
    },
});

const secret = process.env.JWT_KEY;

export const register = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: "Please fill in all the fields" });
    }

    // Check if the email already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.status(400).json({ error: "Email already exists" });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });
    // return res.status(201).json({ id: user._id, name: user.name, email: user.email, role: user.role });

    return res.status(201).json({ message: "User created successfully" });
};

export const login = async (req, res, next) => {
    const { email, password, remember } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: "Please fill in all the fields" });
    }

    const err = validationResult(req);
    if (!err.isEmpty()) {
        return res.status(422).json({ error: err.array()[0].msg});
    }

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(400).json({ error: "User not found" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
        return res.status(400).json({ error: "Invalid credentials" });
    }

    createSetToken(res, user._id, remember);
    return res.status(200).json({ id: user._id, name: user.name, email: user.email, role: user.role });
};

export const logout = (req, res, next) => {
    res.clearCookie("JWTMERNStore");
    return res.status(200).json({ message: "Logged out" });
};

export const getAllUsers = async (req, res) => {
    const users = await User.find({});
    return res.status(200).json(users);
};

export const getCurrentUser = async (req, res) => {
    const users = await User.findById({ _id: req.user._id });

    if (!users) {
        return res.status(404).json({ error: "User not found" });
    }
    return res.status(200).json(users);
};

export const updateCurrentUser = async (req, res) => {
    const { name, email, password, role = "user" } = req.body;

    const user = await User.findById({ _id: req.user._id });

    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }
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

export const deleteUser = async (req, res) => {
    const userId = req.params.userId;
    console.log(userId);

    const user = await User.findOneAndDelete({ _id: userId });

    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }
    return res.status(200).json({ message: "User has been deleted." });
};

export const getUserById = async (req, res) => {
    const userId = req.params.userId;

    const user = await User.findOne({ _id: userId }).select("-password -createAt -updatedAt");

    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }
    return res.status(200).json(user);
};

export const updateUserById = async (req, res) => {
    const userId = req.params.userId;

    const user = await User.findOne({ _id: userId });

    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }

    const { name, email, role } = req.body;

    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;

    const updatedUser = await user.save();

    return res.status(200).json({ _id: updatedUser._id, name: updatedUser.name, email: updatedUser.email, role: updatedUser.role });
};

export default {
    register,
    login,
    logout,
    getAllUsers,
    getCurrentUser,
    updateCurrentUser,
    deleteUser,
    getUserById,
    updateUserById,
};
