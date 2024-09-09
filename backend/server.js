// const dotenv = require("dotenv");
import "./utils/env.js";
import express from "express";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import storeRouter from "./routes/store.js";
import userRouter from "./routes/user.js";
import adminRouter from "./routes/admin.js";
import { setHeaders } from "./middlewares/setHeaders.js";
import cors from "cors";

// Utils
const port = process.env.PORT || 5000;
const app = express();

// Make this variable available in all views
app.use((req, res, next) => {
    next();
});

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:5173', // Allow requests from this origin
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow these HTTP methods
    credentials: true // Allow cookies to be sent with requests
  }));


// Routes
app.use("", storeRouter);
app.use("", userRouter);
app.use("/admin", adminRouter);
app.use((req, res) => {
    res.status(404).json({"error": "Route not found."});
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({"error": "Internal Server Error"});
  });

// Start server
const startServer = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    } catch (err) {
        console.log(err);
    }
};

startServer();
