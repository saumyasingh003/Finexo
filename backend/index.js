import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import uploadRoutes from "./routes/uploadRoutes.js";
import multer from "multer";
import connectDB from "./config/db.js";


dotenv.config();


const app = express();


app.use(cors());
app.use(express.json());

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File size exceeds 2MB limit' });
    }
  }
  res.status(500).json({ message: err.message });
});


app.use("/api", uploadRoutes);

connectDB();


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
