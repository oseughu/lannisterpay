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
        id: undefined,
        customerId: undefined
      }
    }
  }

  PaymentEntity.init(
    {
      uuid: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4 },
      issuer: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          isUppercase: true
        }
      },
      type: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          isUppercase: true
        }
      },
      brand: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          isUppercase: true
        }
      },
      country: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          isUppercase: true
        }
      },
      number: {
        type: DataTypes.BIGINT,
        validate: {
          isNumeric: { msg: 'Please enter a valid card or phone number' },
          len: [10, 16]
        }
      },
      six_id: {
        type: DataTypes.BIGINT,
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
