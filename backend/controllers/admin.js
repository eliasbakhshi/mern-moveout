import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Product from "../models/Product.js";
import User from "../models/User.js";

const secret = process.env.JWT_KEY;

export const addProduct = async (req, res) => {
    const { name, description, imagePath, price, stock } = req.body;

    // Check if the product already exists
    const productExists = await Product.findOne({ name, description, imagePath, price, stock, userId: req.user._id });
    if (productExists) {
        return res.status(400).json({ error: "Product already exists" });
    }
    const product = await Product.create({ name, description, price });
    return res.status(201).json({ product });
};

export const dashboard = async (req, res) => {
    return res.status(200).json({ message: "Welcome to the dashboard" });
};

export default {
    addProduct,
    dashboard,
};
