import jwt from "jsonwebtoken";

const createSetToken = (res, id) => {
    const token = jwt.sign({ id }, process.env.JWT_KEY, { expiresIn: "30d" });
    res.cookie("JWTMERNStore", token, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });
};

export default createSetToken;
