'use strict'
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable('fees', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      fee_id: {
        type: DataTypes.STRING,
        allowNull: false
      },
      fee_locale: {
        type: DataTypes.STRING,
        allowNull: false
      },
      fee_currency: {
        type: DataTypes.STRING,
        allowNull: false
      },
      fee_entity: {
        type: DataTypes.STRING,
        allowNull: false
      },
      entity_property: {
        type: DataTypes.STRING,
        defaultValue: '*'
      },
      fee_type: {
        type: DataTypes.STRING,
        allowNull: false
      },
      fee_flat: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      fee_value: {
        type: DataTypes.INTEGER,
        allowNull: false
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
  async down(queryInterface, DataTypes) {
    await queryInterface.dropTable('fees')
  }
}
