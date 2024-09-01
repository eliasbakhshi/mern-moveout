// import User from "../models/User.js";
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";
// import { validationResult } from "express-validator";

// const secret = process.env.JWT_KEY;

export const home = (req, res) => {
    return res.status(200).json({ message: "Welcome to the MERN Store API" });
};
export const home2 = (req, res) => {
    return res.status(200).json({ message: "Welcome to the MERN Store API" });
};

export default {
    home,
};
