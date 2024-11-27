const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const ensureDirectoryExists = (directory) => {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
};

// Configure storage for multiple file types
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath;
    
    if (file.fieldname === 'certificates') {
      uploadPath = 'uploads/tutors/certificates/';
    } else if (file.fieldname === 'profileImage') {
      uploadPath = 'uploads/tutors/profile/';
    } else {
      uploadPath = 'uploads/tutors/misc/';
    }

    // Ensure directory exists
    ensureDirectoryExists(uploadPath);
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Allow multiple file types
  const allowedTypes = [
    'image/jpeg', 
    'image/png', 
    'image/gif', 
    'application/pdf', 
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Supported types: JPEG, PNG, GIF, PDF, DOC, DOCX'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 10 // 10MB file size limit
  }
});

// Custom middleware to handle multiple files
const handleTutorUpload = (req, res, next) => {
  const multiUpload = upload.fields([
    { name: 'certificates', maxCount: 5 }, // Allow up to 5 certificates
    { name: 'profileImage', maxCount: 1 }
  ]);

  multiUpload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({
        success: false,
        message: 'File upload error',
        error: err.message
      });
    } else if (err) {
      return res.status(500).json({
        success: false,
        message: 'Unknown upload error',
        error: err.message
      });
    }
    next();
  });
};

module.exports = handleTutorUpload;