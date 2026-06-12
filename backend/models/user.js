'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // define association here
    }
  }
  User.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    role: {
      type: DataTypes.ENUM('MAHASISWA', 'STAFF', 'KABAG', 'KEUANGAN'),
      allowNull: false
    },
    supabase_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true
    }
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};
