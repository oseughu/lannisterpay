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
        customerId: undefined
      }
    }
  }
  Transaction.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          notNull: { msg: 'Please enter an amount for this transaction' },
          notEmpty: { msg: 'Amount cannot be blank' },
          isNumeric: { msg: 'Please enter a valid amount' }
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
