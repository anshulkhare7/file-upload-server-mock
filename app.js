const express = require("express");
const multer = require("multer");
const path = require("path");

// Set the folder to save uploaded files (can be easily changed)
const UPLOAD_FOLDER = "./uploads/";

// Define the maximum file size (5 MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Supported file types
const ALLOWED_FILE_TYPES = [".txt", ".pdf", ".jpg", ".mp4"];

// Initialize Express app
const app = express();

// Set up multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_FOLDER);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// File filtering to allow only specific file types
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ALLOWED_FILE_TYPES.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("File type not allowed"), false);
  }
};

// Middleware to handle file uploads
const upload = multer({
  storage: storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: fileFilter,
}).single("file");

// POST endpoint to upload a file
app.post("/upload", (req, res) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
      return res
        .status(400)
        .json({ message: "File is too large. Max size is 5MB." });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }

    if (!req.file) {
      return res
        .status(400)
        .json({ message: "No file uploaded or invalid file type." });
    }

    res.json({
      message: "File uploaded successfully!",
      fileName: req.file.filename,
    });
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
