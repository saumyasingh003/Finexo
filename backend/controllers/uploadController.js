import { validateExcel } from "../utils/validation.js";
import Data from "../models/DataModel.js";

export const uploadFile = async (req, res) => {
  try {
    
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

  
    const maxSize = 2 * 1024 * 1024; 
    if (req.file.size > maxSize) {
      return res.status(400).json({ message: "File size exceeds 2MB limit" });
    }

    const { errors, sheets, data } = await validateExcel(req.file.buffer);

    res.status(200).json({
      errors,
      sheets,
      data
    });
  } catch (err) {
    console.error("Error uploading file:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const importData = async (req, res) => {
  try {
    const { data, errors = [] } = req.body;

    if (!data || !Array.isArray(data)) {
      return res.status(400).json({ message: "Invalid data format" });
    }

 
    const validRows = data.filter((row, index) => {
      return !errors.some(error => error.row === index + 2);
    });

    
    const processedRows = validRows.map(row => ({
      name: row.name,
      amount: typeof row.amount === 'string' ? parseFloat(row.amount) : row.amount,
      date: new Date(row.date),
      
      verified: typeof row.verified === 'string' 
        ? row.verified.toLowerCase() === 'yes'
        : Boolean(row.verified),
      sheet: row.sheet
    }));

    
    await Data.insertMany(processedRows);

    res.status(200).json({
      message: "Data imported successfully",
      imported_count: validRows.length,
      skipped_count: data.length - validRows.length
    });
  } catch (err) {
    console.error("Error importing data:", err);
    res.status(500).json({ 
      message: "Error importing data",
      error: err.message 
    });
  }
};