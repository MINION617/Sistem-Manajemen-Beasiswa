'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Sponsor extends Model {
    static associate(models) {
      Sponsor.hasMany(models.Scholarship, {
        foreignKey: 'sponsor_id',
        as: 'scholarships'
      });
    }
  }
  Sponsor.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    description: DataTypes.TEXT,
    contact_info: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Sponsor',
  });
  return Sponsor;
};
