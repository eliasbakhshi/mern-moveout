import jwt from "jsonwebtoken";
import User from "../models/User.js";
import asyncHandler from "express-async-handler";

const validateToken = asyncHandler(async (req, res, next) => {
  let token = req.cookies.JWTMERNMoveOut;
  if (!token) { 
    return res
      .status(401)
      .json({ message: "You need to be logged in to access this route" });
  }

  const decoded = jwt.verify(token, process.env.JWT_KEY);
  if (!decoded) {
    return res.status(401).json({ message: "Invalid token" });
  }

  // Save the user to the request
  req.user = await User.findById(decoded.id);
  next();
});

export default validateToken;
