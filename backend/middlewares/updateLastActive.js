/* Middleware to Update Last Active Date */

import User from '../models/User.js';

export const updateLastActive = async (req, res, next) => {
  if (req?.user) {
    await User.findByIdAndUpdate(req.user._id, { lastActive: Date.now() });
  }
  next();
};

export default updateLastActive;
