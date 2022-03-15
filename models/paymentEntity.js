'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class PaymentEntity extends Model {
    static associate({ Customer }) {
      this.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' })
    }

    toJSON() {
      return {
        ...this.get(),
        customerId: undefined,
        number: undefined
      }
    }
  }

  PaymentEntity.init(
    {
      uuid: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4 },
      issuer: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: 'Please enter an issuer (GTBank, Wema, MTN)' },
          notEmpty: { msg: 'Issuer field cannot be blank' }
        }
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: 'Please enter a payment entity type (credit-card, debit-card, bank-account, ussd)'
          },
          notEmpty: { msg: 'Payment entity type cannot be blank' }
        }
      },
      brand: {
        type: DataTypes.STRING,
        isUppercase: true,
        defaultValue: '*'
      },
      country: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: 'Please enter a country' },
          notEmpty: { msg: 'Country field cannot be blank' },
          isIn: [['NG', 'US', 'UK']]
        }
      },
      number: {
        type: DataTypes.BIGINT,
        validate: {
          isNumeric: { msg: 'Please enter a valid 16-digit card number' },
          len: [16, 16]
        }
      },
      six_id: {
        type: DataTypes.INTEGER,
        validate: {
          isNumeric: { msg: 'Please enter a valid 6-digit number' },
          len: [6, 6]
        }
      }
    },
    {
      sequelize,
      tableName: 'payment_entities',
      modelName: 'PaymentEntity'
    }
  )
  return PaymentEntity
}
