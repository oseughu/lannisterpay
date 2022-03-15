'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Customer extends Model {
    static associate({ Transaction, PaymentEntity }) {
      this.hasMany(Transaction, {
        foreignKey: 'customerId',
        as: 'transactions'
      })
      this.hasMany(PaymentEntity, {
        foreignKey: 'customerId',
        as: 'payment_entities'
      })
    }

    toJSON() {
      return {
        ...this.get(),
        password: undefined
      }
    }
  }
  Customer.init(
    {
      full_name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: 'Please enter your full name' },
          notEmpty: { msg: 'Name cannot be blank' }
        }
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: 'User must have an email' },
          notEmpty: { msg: 'Email cannot be empty' },
          isEmail: { msg: 'Please enter a valid email address' }
        }
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: 'User must have a password' },
          notEmpty: { msg: 'Password cannot be empty' },
          min: 8
        }
      },
      bears_fee: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        validate: {
          notNull: { msg: 'Does this user bear the fee?' },
          notEmpty: { msg: 'bears_fee field cannot be empty' }
        }
      }
    },
    {
      sequelize,
      tableName: 'customers',
      modelName: 'Customer'
    }
  )
  return Customer
}
