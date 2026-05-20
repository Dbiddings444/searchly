const express = require('express');
const router = express.Router();
const imageController = require('../controllers/imageController');

// Route to upload an image
router.post('/upload-url', imageController.getUploadUrl);
router.post('/', imageController.uploadImageData);

// Route to get all images
router.get('/', imageController.getAllImages);
// Route to get a specific image by ID
router.get('/:id', imageController.getImageById);
// Route to update an image's tags and description
router.put('/:id', imageController.updateImage);
// Route to delete an image
router.delete('/:id', imageController.deleteImage);

module.exports = router;