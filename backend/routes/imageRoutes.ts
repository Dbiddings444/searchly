const express = require('express');
const router = express.Router();
const imageController = require('../controllers/imageController');

// Route to upload an image
router.post('/upload-url', imageController.getUploadUrl);
router.post('/images', imageController.uploadImage);

// Route to get all images
router.get('/images', imageController.getAllImages);
// Route to get a specific image by ID
router.get('/images/:id', imageController.getImageById);
// Route to update an image's tags and description
router.put('/images/:id', imageController.updateImage);
// Route to delete an image
router.delete('/images/:id', imageController.deleteImage);

module.exports = router;