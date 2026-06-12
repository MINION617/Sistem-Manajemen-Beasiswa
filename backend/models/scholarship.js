'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Scholarship extends Model {
    static associate(models) {
      Scholarship.belongsTo(models.Sponsor, {
        foreignKey: 'sponsor_id',
        as: 'sponsor'
      });
    }
  }
  Scholarship.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    sponsor_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: DataTypes.TEXT,
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    deadline: {
      type: DataTypes.DATE,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('OPEN', 'CLOSED'),
      allowNull: false,
      defaultValue: 'OPEN'
    }
  }, {
    sequelize,
    modelName: 'Scholarship',
  });
  return Scholarship;
};
