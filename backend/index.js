import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import uploadRoutes from "./routes/uploadRoutes.js";
import multer from "multer";


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

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
