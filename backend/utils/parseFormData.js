// Middleware to parse FormData (multipart/form-data) fields only, no files
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Use as: upload.none()
module.exports = upload;
