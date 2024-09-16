import jwt from "jsonwebtoken";

const createSetToken = (res, id, remember) => {
  const expiresIn = remember ? "30d" : "1d";
  const oneMonth = remember ? 30 : 1;
  const token = jwt.sign({ id }, process.env.JWT_KEY, { expiresIn });
  res.cookie("JWTMERNMoveOut", token, {
    maxAge: oneMonth * 24 * 60 * 60 * 1000,
    httpOnly: true,
  });
};

export default createSetToken;
