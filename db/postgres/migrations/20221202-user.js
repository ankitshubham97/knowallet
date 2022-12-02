'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      walletAddress: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      proofAge: {
        type: Sequelize.STRING(32768),
        allowNull: true,
      },
      calldataAge: {
        type: Sequelize.STRING(32768),
        allowNull: true,
      },
      proofCountry: {
        type: Sequelize.STRING(32768),
        allowNull: true,
      },
      calldataCountry: {
        type: Sequelize.STRING(32768),
        allowNull: true,
      },
      nftUrl: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('Users');
  },
};
