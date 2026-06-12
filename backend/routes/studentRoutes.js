const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');

// Public listing for open scholarships (could be filtered by role too)
router.get('/scholarships/open', studentController.getOpenScholarships);

// Protected student routes
router.use(authMiddleware);
router.use(roleMiddleware(['MAHASISWA']));

router.get('/profile', studentController.getStudentProfile);
router.post('/documents', studentController.saveDocumentMetadata);
router.post('/apply', studentController.applyForScholarship);

module.exports = router;
