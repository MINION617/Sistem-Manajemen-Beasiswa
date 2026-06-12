const { Sponsor } = require('../models');

exports.getAllSponsors = async (req, res) => {
  try {
    const sponsors = await Sponsor.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json(sponsors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createSponsor = async (req, res) => {
  try {
    const { name, description, contact_info } = req.body;
    const sponsor = await Sponsor.create({ name, description, contact_info });
    res.status(201).json(sponsor);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateSponsor = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, contact_info } = req.body;
    const sponsor = await Sponsor.findByPk(id);
    if (!sponsor) return res.status(404).json({ message: 'Sponsor not found' });

    await sponsor.update({ name, description, contact_info });
    res.json(sponsor);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteSponsor = async (req, res) => {
  try {
    const { id } = req.params;
    const sponsor = await Sponsor.findByPk(id);
    if (!sponsor) return res.status(404).json({ message: 'Sponsor not found' });

    await sponsor.destroy();
    res.json({ message: 'Sponsor deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
