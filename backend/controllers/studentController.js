const { Scholarship, Application, Document, Sponsor } = require('../models');

exports.getOpenScholarships = async (req, res) => {
  try {
    const scholarships = await Scholarship.findAll({
      where: { status: 'OPEN' },
      include: [{ model: Sponsor, as: 'sponsor', attributes: ['name'] }]
    });
    res.json(scholarships);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getStudentProfile = async (req, res) => {
  try {
    const documents = await Document.findAll({
      where: { user_id: req.user.id }
    });
    const applications = await Application.findAll({
      where: { user_id: req.user.id },
      include: [{ model: Scholarship, as: 'scholarship' }]
    });
    res.json({ user: req.user, documents, applications });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.saveDocumentMetadata = async (req, res) => {
  try {
    const { file_name, file_url, type } = req.body;
    const document = await Document.create({
      user_id: req.user.id,
      file_name,
      file_url,
      type
    });
    res.status(201).json(document);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.applyForScholarship = async (req, res) => {
  try {
    const { scholarship_id } = req.body;
    
    // Check if scholarship is open
    const scholarship = await Scholarship.findByPk(scholarship_id);
    if (!scholarship || scholarship.status !== 'OPEN') {
      return res.status(400).json({ message: 'Scholarship is not open for applications' });
    }

    const application = await Application.create({
      user_id: req.user.id,
      scholarship_id
    });
    res.status(201).json(application);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'You have already applied for this scholarship' });
    }
    res.status(400).json({ message: error.message });
  }
};
