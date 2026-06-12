'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Document extends Model {
    static associate(models) {
      Document.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    }
  }
  Document.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    file_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    file_url: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('KTM', 'TRANSKRIP', 'SERTIFIKAT', 'BUKTI_TRANSFER', 'LAINNYA'),
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Document',
  });
  return Document;
};
