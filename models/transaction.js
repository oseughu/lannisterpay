'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Transaction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ PaymentEntity }) {
      // define association here
      this.belongsTo(PaymentEntity, {
        foreignKey: 'paymentEntityId',
        as: 'payment_method'
      })
    }

    toJSON() {
      return {
        ...this.get(),
        id: undefined,
        customerId: undefined
      }
    }
  }
  Transaction.init(
    {
      uuid: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4 },

      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          notNull: { msg: 'Please enter an amount for this transaction' },
          notEmpty: { msg: 'Amount cannot be blank' },
          isDecimal: { msg: 'Please enter a valid amount' }
        }
      },
      currency: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: 'Please enter a currency' },
          notEmpty: { msg: 'Currency field cannot be blank' },
          len: [3, 3]
        }
      },
      currency_country: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: 'Please enter a country' },
          notEmpty: { msg: 'Country cannot be blank' },
          len: [2, 3]
        }
      }
    },
    {
      sequelize,
      tableName: 'transactions',
      modelName: 'Transaction'
    }
  )
  return Transaction
}
