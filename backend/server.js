import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import dotenv from "dotenv";
import express from "express";
import cookieParser from "cookie-parser";
import moongose from "mongoose";

// Utils

dotenv.config({ path: `.env${process.env.NODE_ENV}` });
const port = process.env.PORT || 5000;
const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/", (req, res) => {
    res.send("testing");
});
try {
    await moongose.connect(process.env.MONGO_URI);
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
} catch (error) {
    console.log(err);
}
