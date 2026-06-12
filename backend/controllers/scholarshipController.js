const { Scholarship, Sponsor } = require('../models');

exports.getAllScholarships = async (req, res) => {
  try {
    const scholarships = await Scholarship.findAll({
      include: [{ model: Sponsor, as: 'sponsor', attributes: ['name'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json(scholarships);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createScholarship = async (req, res) => {
  try {
    const { sponsor_id, name, description, amount, deadline, status } = req.body;
    const scholarship = await Scholarship.create({ 
      sponsor_id, 
      name, 
      description, 
      amount, 
      deadline, 
      status 
    });
    res.status(201).json(scholarship);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateScholarship = async (req, res) => {
  try {
    const { id } = req.params;
    const { sponsor_id, name, description, amount, deadline, status } = req.body;
    const scholarship = await Scholarship.findByPk(id);
    if (!scholarship) return res.status(404).json({ message: 'Scholarship not found' });

    await scholarship.update({ 
      sponsor_id, 
      name, 
      description, 
      amount, 
      deadline, 
      status 
    });
    res.json(scholarship);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteScholarship = async (req, res) => {
  try {
    const { id } = req.params;
    const scholarship = await Scholarship.findByPk(id);
    if (!scholarship) return res.status(404).json({ message: 'Scholarship not found' });

    await scholarship.destroy();
    res.json({ message: 'Scholarship deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
