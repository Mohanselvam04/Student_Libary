const express = require('express');
const router = express.Router();
const { uploadMaterial, getMaterials, deleteMaterial } = require('../controllers/materialController');
const { protect, instructorOrAdmin } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

router.get('/', protect, getMaterials);
router.post('/', protect, instructorOrAdmin, upload.single('file'), uploadMaterial);
router.delete('/:id', protect, instructorOrAdmin, deleteMaterial);

module.exports = router;
