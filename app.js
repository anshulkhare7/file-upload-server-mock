const express = require("express");
const multer = require("multer");
const path = require("path");
const jwt = require("jsonwebtoken");

// Set the folder to save uploaded files (can be easily changed)
const UPLOAD_FOLDER = "/Users/anshul/tmp/uploads/";

// Define the maximum file size (5 MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Supported file types
const ALLOWED_FILE_TYPES = [".txt", ".pdf", ".jpg", ".mp4"];

// Secret key to sign the JWT token
const JWT_SECRET = "honeycomb"; // Change this to a more secure secret

// Initialize Express app
const app = express();

// Set up multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_FOLDER);
  },
  filename: (req, file, cb) => {
    console.log(`Receiving file: ${file.originalname}`); // Log the file name when the request is received
    cb(null, file.originalname);
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

// Middleware for verifying JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }

    req.user = user;
    next();
  });
}

// POST endpoint to upload a file (requires authentication)
app.post("/upload", authenticateToken, (req, res) => {
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

    // Log when the file is saved
    const filePath = path.join(UPLOAD_FOLDER, req.file.originalname);
    console.log(`File saved successfully at: ${filePath}`);

    res.json({
      message: "File uploaded successfully!",
      fileName: req.file.originalname,
    });
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
