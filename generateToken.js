const jwt = require("jsonwebtoken");

// Secret key to sign the JWT token (should match the one used in app.js)
const JWT_SECRET = "honeycomb"; // Same as in your app.js

// Payload (you can add user information here if needed)
const payload = {
  username: "anshul.khare",
};

// Generate the token
const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });

console.log("Generated Token:", token);
