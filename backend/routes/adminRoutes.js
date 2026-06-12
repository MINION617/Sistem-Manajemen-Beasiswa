const express = require('express');
const router = express.Router();
const sponsorController = require('../controllers/sponsorController');
const scholarshipController = require('../controllers/scholarshipController');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');

// Apply auth and staff role check to all admin routes
router.use(authMiddleware);
router.use(roleMiddleware(['STAFF']));

// Sponsor Routes
router.get('/sponsors', sponsorController.getAllSponsors);
router.post('/sponsors', sponsorController.createSponsor);
router.put('/sponsors/:id', sponsorController.updateSponsor);
router.delete('/sponsors/:id', sponsorController.deleteSponsor);

// Scholarship Routes
router.get('/scholarships', scholarshipController.getAllScholarships);
router.post('/scholarships', scholarshipController.createScholarship);
router.put('/scholarships/:id', scholarshipController.updateScholarship);
router.delete('/scholarships/:id', scholarshipController.deleteScholarship);

module.exports = router;
