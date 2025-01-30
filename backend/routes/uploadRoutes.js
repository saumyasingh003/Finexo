import express from "express";
import multer from "multer";
import { uploadFile, importData } from "../controllers/uploadController.js";


const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024 
  },
  fileFilter: (req, file, cb) => {
    // Accept only excel files
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
        file.mimetype === 'application/vnd.ms-excel') {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files are allowed'));
    }
  }
});

const router = express.Router();


router.post("/upload", upload.single("excel_file"), uploadFile);


router.post("/import", importData);

export default router;