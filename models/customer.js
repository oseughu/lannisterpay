'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Customer extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ Transaction, PaymentEntity }) {
      // define association here
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
        id: undefined,
        password: undefined,
        balance: undefined
      }
    }
  }
  Customer.init(
    {
      uuid: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4 },
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
          notEmpty: { msg: 'Bears Fee field cannot be empty' }
        }
      },
      balance: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.0 }
    },
    {
      sequelize,
      tableName: 'customers',
      modelName: 'Customer'
    }
  )
  return Customer
}
