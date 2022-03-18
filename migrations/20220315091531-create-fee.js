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
        defaultValue: '*'
      },
      fee_currency: {
        type: DataTypes.STRING,
        allowNull: false
      },
      fee_entity: {
        type: DataTypes.STRING,
        defaultValue: '*'
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
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.0
      },
      fee_value: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.0
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
