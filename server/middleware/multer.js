const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Configure storage for multiple file types
const configureStorage = () => {
  const getUploadPath = (fieldname) => {
    const uploadPathMap = {
      certificates: 'uploads/tutors/certificates/',
      profileImage: 'uploads/tutors/profile/',
      default: 'uploads/tutors/misc/'
    };
    return uploadPathMap[fieldname] || uploadPathMap.default;
  };

  return multer.diskStorage({
    destination: async (req, file, cb) => {
      const uploadPath = getUploadPath(file.fieldname);
      
      try {
        // Use promises-based mkdir for better async handling
        await fs.mkdir(uploadPath, { recursive: true });
        cb(null, uploadPath);
      } catch (err) {
        cb(err);
      }
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
      cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
  });
};

 //  certificate file filter 

const createFileFilter = () => {
  const ALLOWED_MIME_TYPES = new Set([
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]);

  const ALLOWED_EXTENSIONS = new Set([
    '.jpg', '.jpeg', '.png', '.gif', 
    '.pdf', '.doc', '.docx'
  ]);

  return (req, file, cb) => {
    const isValidMimeType = ALLOWED_MIME_TYPES.has(file.mimetype);
    const isValidExtension = ALLOWED_EXTENSIONS.has(path.extname(file.originalname).toLowerCase());

    if (isValidMimeType && isValidExtension) {
      cb(null, true);
    } else {
      const error = new Error('Invalid file type. Supported types: JPEG, PNG, GIF, PDF, DOC, DOCX');
      error.code = 'UNSUPPORTED_FILE_TYPE';
      cb(error, false);
    }
  };
};


// certificate upload middleware
const handleTutorUpload = () => {
  const upload = multer({
    storage: configureStorage(),
    fileFilter: createFileFilter(),
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB file size limit
      files: 6 // Total number of files (5 certificates + 1 profile image)
    }
  });

  const multiUpload = upload.fields([
    { name: 'certificates', maxCount: 5 },
    { name: 'profileImage', maxCount: 1 }
  ]);

  return (req, res, next) => {
    multiUpload(req, res, (err) => {
      if (err) {
        // More detailed error handling
        switch (err.code) {
          case 'LIMIT_FILE_SIZE':
            return res.status(400).json({
              success: false,
              message: 'File too large. Maximum size is 10MB',
              error: err.message
            });
          case 'UNSUPPORTED_FILE_TYPE':
            return res.status(400).json({
              success: false,
              message: 'Unsupported file type',
              error: err.message
            });
          case 'LIMIT_FILE_COUNT':
            return res.status(400).json({
              success: false,
              message: 'Too many files uploaded',
              error: err.message
            });
          default:
            return res.status(500).json({
              success: false,
              message: 'Upload error',
              error: err.message
            });
        }
      }
      next();
    });
  };
};

module.exports = handleTutorUpload();