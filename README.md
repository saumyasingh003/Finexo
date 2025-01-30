# Finexo - Excel Data Import System

Finexo is a web application that allows users to upload, validate, and import Excel data with a user-friendly interface and real-time feedback.

## Quick Start Guide

### 1. Environment Setup

1. Create `.env` file in the backend directory:
```env
PORT=8000
MONGO_URI=mongodb://localhost:27017/finexo
NODE_ENV=development
```

2. Create `.env` file in the frontend directory (if needed):
```env
VITE_API_URL=http://localhost:8000
```

### 2. Running the Application

Start both frontend and backend servers:

```bash
# Terminal 1 - Backend
cd backend
npm install
npm run dev

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev
```

The application will be running at:
- Frontend: http://localhost:5173
- Backend: http://localhost:8000

### 3. Testing with Sample Data

1. Create a sample Excel file (example.xlsx) with the following structure:

```
| name    | amount  | date       | verified |
|---------|---------|------------|----------|
| John    | 1000.50 | 2024-03-20 | Yes      |
| Jane    | 2500.75 | 2024-03-21 | No       |
```

2. Upload the file:
   - Open http://localhost:5173
   - Drag and drop your Excel file onto the upload area (or click to select)
   - Watch the upload progress
   - Review any validation errors in the modal (if they appear)
   - Select the sheet from the dropdown
   - Click "Import Data" to process the valid rows

Common validation rules:
- Name: Cannot be empty
- Amount: Must be a positive number
- Date: Must be a valid date
- Verified: Must be "Yes" or "No" (case insensitive)

## Detailed Setup Instructions

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
PORT=8000
MONGO_URI=mongodb://localhost:27017/finexo
NODE_ENV=development
```

4. Start the development server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

## Environment Variables

### Backend (.env)
```env
# Required
MONGO_URI=mongodb://localhost:27017/finexo  # MongoDB connection string
PORT=8000                                   # Server port number
NODE_ENV=development                        # Environment (development/production)

# Optional
CORS_ORIGIN=http://localhost:5173          # Frontend URL for CORS
MAX_FILE_SIZE=2                            # Max file size in MB
```

### Frontend (.env)
```env
# Optional - defaults to http://localhost:8000
VITE_API_URL=http://localhost:8000         # Backend API URL
```

## Sample Excel File Structure

Create a file named `sample.xlsx` with these columns:

```excel
Sheet1:
| Column Name | Data Type | Example     | Notes                    |
|------------|-----------|-------------|--------------------------|
| name       | String    | John Doe    | Required                 |
| amount     | Number    | 1234.56     | Required, > 0            |
| date       | Date      | 2024-03-20  | Required, YYYY-MM-DD     |
| verified   | String    | Yes/No      | Optional                 |
```

You can also download a sample file here: [sample.xlsx](./samples/sample.xlsx)

## Troubleshooting

1. **MongoDB Connection Issues**
   - Ensure MongoDB is running locally
   - Check MONGO_URI in .env
   - Try connecting with MongoDB Compass

2. **File Upload Errors**
   - Check file size (max 2MB)
   - Verify file format (.xlsx or .xls)
   - Ensure all required columns are present

3. **CORS Issues**
   - Verify frontend URL matches CORS_ORIGIN in backend .env
   - Check browser console for CORS errors

4. **Import Failures**
   - Review validation errors in the modal
   - Check data formats match requirements
   - Ensure MongoDB has write permissions

[Rest of the README remains the same...]
