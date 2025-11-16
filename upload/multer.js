const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|pdf|mp4/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  if (extname && mimetype) {
    return cb(null, true);
  }
  cb('Error: Images, Videos or PDFs Only!');
};

const upload = multer({ storage, fileFilter, limits: {fileSize: 10 * 1024  * 1024} });

module.exports = upload;
