import jwt from "jsonwebtoken";

const createSetToken = (res, id, remember = false) => {
  const expiresIn = remember ? "30d" : "1d";
  const expirationTime = remember ? 30 : 1;
  const oneDay = 24 * 60 * 60 * 1000;
  const token = jwt.sign({ id }, process.env.JWT_KEY, { expiresIn });
  res.cookie("JWTMERNMoveOut", token, {
    maxAge: expirationTime * oneDay,
    httpOnly: true,
  });
};

export default createSetToken;
