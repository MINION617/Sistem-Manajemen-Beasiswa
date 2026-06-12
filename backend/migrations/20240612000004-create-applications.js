'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Applications', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      scholarship_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Scholarships',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      status: {
        type: Sequelize.ENUM('PENDING', 'VERIFIED', 'REJECTED', 'PAID'),
        allowNull: false,
        defaultValue: 'PENDING'
      },
      applied_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now')
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Unique constraint to prevent duplicate applications
    await queryInterface.addIndex('Applications', ['user_id', 'scholarship_id'], {
      unique: true,
      name: 'unique_user_scholarship_application'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Applications');
  }
};
