'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Application extends Model {
    static associate(models) {
      Application.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
      Application.belongsTo(models.Scholarship, { foreignKey: 'scholarship_id', as: 'scholarship' });
    }
  }
  Application.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    scholarship_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'VERIFIED', 'REJECTED', 'PAID'),
      allowNull: false,
      defaultValue: 'PENDING'
    },
    applied_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'Application',
  });
  return Application;
};
