'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class PaymentEntity extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ Customer }) {
      // define association here
      this.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' })
    }

    toJSON() {
      return {
        ...this.get(),
        id: undefined,
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
            msg: 'Please enter a payment entity type (credit-card, debit-card)'
          },
          notEmpty: { msg: 'Card type cannot be blank' },
          isIn: [
            ['CREDIT-CARD', 'DEBIT-CARD', 'BANK-ACCOUNT', 'USSD', 'WALLET-ID']
          ]
        }
      },
      brand: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: 'Please enter a brand (MASTERCARD, VISA)' },
          notEmpty: { msg: 'Brand field cannot be blank' }
        }
      },
      country: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: 'Please enter a country' },
          notEmpty: { msg: 'Country field cannot be blank' },
          isIn: [['NG']]
        }
      },
      number: {
        type: DataTypes.INTEGER,
        validate: {
          isCreditCard: { msg: 'Please enter a valid 16-digit card number' }
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
