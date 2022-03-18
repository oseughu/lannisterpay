'use strict'
module.exports = {
  up: async (queryInterface, DataTypes) => {
    await queryInterface.createTable('payment_entities', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      uuid: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4 },
      issuer: {
        type: DataTypes.STRING,
        allowNull: false
      },
      type: {
        type: DataTypes.STRING,
        defaultValue: ''
      },
      brand: {
        type: DataTypes.STRING,
        defaultValue: ''
      },
      country: {
        type: DataTypes.STRING,
        allowNull: false
      },
      number: {
        type: DataTypes.BIGINT,
        allowNull: false
      },
      six_id: {
        type: DataTypes.BIGINT,
        allowNull: false
      },
      customerId: {
        allowNull: false,
        type: DataTypes.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE
      }
    })
  },
  down: async (queryInterface, DataTypes) => {
    await queryInterface.dropTable('payment_entities')
  }
}
