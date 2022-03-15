'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Fee extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }

    toJSON() {
      return {
        ...this.get(),
        id: undefined
      }
    }
  }
  Fee.init(
    {
      fee_id: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: 'Please enter the fee id (LNPY****)' },
          notEmpty: { msg: 'fee id cannot be blank' },
          contains: 'LNPY',
          isAlphanumeric: true,
          len: [8, 8]
        }
      },
      fee_locale: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: 'Please enter the fee locale (LOCL or INTL)' },
          notEmpty: { msg: 'fee locale cannot be blank' },
          isIn: [['LOCL', 'INTL']]
        }
      },
      fee_currency: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: 'Please enter the fee currency (NGN, USD)' },
          notEmpty: { msg: 'fee currency cannot be blank' },
          isUppercase: true,
          len: [3, 3]
        }
      },
      fee_entity: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: 'Please enter a fee entity (CREDIT-CARD, DEBIT-CARD, BANK-ACCOUNT, USSD)'
          },
          notEmpty: { msg: 'Fee entity cannot be blank' },
          isUppercase: true
        }
      },
      entity_property: {
        type: DataTypes.STRING,
        isUppercase: true,
        defaultValue: '*'
      },
      fee_type: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: 'Please enter a fee type (flat perc, or flat_perc)'
          },
          notEmpty: { msg: 'Fee type cannot be blank' },
          isIn: [['flat', 'perc', 'flat perc']]
        }
      },
      fee_flat: { type: DataTypes.INTEGER, defaultValue: 0 },
      fee_value: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: { msg: 'Please enter a fee value' },
          notEmpty: { msg: 'Fee value cannot be blank' }
        }
      }
    },
    {
      sequelize,
      tableName: 'fees',
      modelName: 'Fee'
    }
  )
  return Fee
}
