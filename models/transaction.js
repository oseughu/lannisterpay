'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Transaction extends Model {
    static associate({ PaymentEntity }) {
      this.belongsTo(PaymentEntity, {
        foreignKey: 'paymentEntityId',
        as: 'payment_method'
      })
    }

    toJSON() {
      return {
        ...this.get(),
        paymentEntityId: undefined
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
          notEmpty: { msg: 'Amount cannot be blank' }
        }
      },
      currency: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: 'Please enter a currency' },
          notEmpty: { msg: 'Currency field cannot be blank' },
          isUppercase: { msg: 'Currency should be in uppercase letters' },
          len: [3, 3]
        }
      },
      currency_country: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: 'Please enter a country' },
          notEmpty: { msg: 'Currency country field cannot be blank' },
          isUppercase: {
            msg: 'Currency country should be in uppercase letters'
          },
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
