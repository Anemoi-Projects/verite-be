const express = require('express');
const router = express.Router();
const upload = require('../upload/multer');
const cloudinary = require('../upload/cloudinary');
const fs = require('fs');

router.post('/single', upload.single('image'), async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path);
    
    // // Optional: remove local file
    // fs.unlinkSync(req.file.path);

    res.json({ url: result.secure_url });
  } catch (err) {
    res.status(500).json({ error: 'Upload failed', details: err });
  }
});

module.exports = router;