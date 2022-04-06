import 'dotenv/config'
import compression from 'compression'
import express, { json } from 'express'
import mongoose from 'mongoose'
import mongooseRedisCaching from 'mongoose-redis-caching'
import { Fee, Transaction } from './models/schema.js'

const app = express()
const port = process.env.PORT || 3000

app.use(compression())
app.use(json())
mongooseRedisCaching(mongoose)

app.post(
  '/fees',
  // passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const { FeeConfigurationSpec } = req.body

    let feeId,
      feeLocale, //optional, LOCL or INTL
      feeCurrency,
      feeEntity, //optional, CREDIT-CARD, DEBIT-CARD, BANK-ACCOUNT, USSD
      entityProperty, //optional, MASTERCARD, VISA, MTN, GTBANK
      feeType, //FLAT, PERC OR FLAT PERC
      feeFlat, //optional, flat amount to be added if feeType is FLAT or FLAT PERC
      feePerc, //optional, percentage value to be charged for the transaction if feeType is PERC or FLAT PERC
      feeValue

    try {
      let newArr = FeeConfigurationSpec.split('\n')

      newArr.forEach(spec => {
        let specArr = spec.split(' ')
        let entityArr = specArr[3].split('(')
        let feeArr = specArr[7].split(':')
        feeId = specArr[0]
        feeCurrency = specArr[1]
        feeLocale = specArr[2]
        feeEntity = entityArr[0]
        entityProperty = entityArr[1].slice(0, -1)
        feeType = specArr[6]
        feeFlat =
          feeType === 'FLAT'
            ? specArr[7]
            : feeType === 'FLAT_PERC'
            ? +parseFloat(feeArr[0]).toFixed(2)
            : 0
        feePerc =
          feeType === 'PERC'
            ? specArr[7]
            : feeType === 'FLAT_PERC'
            ? +parseFloat(feeArr[1]).toFixed(2)
            : 0
        feeValue =
          feeType === 'FLAT_PERC'
            ? `${feeFlat}:${feePerc}`
            : feeType === 'FLAT'
            ? feeFlat
            : feePerc

        Fee.create({
          FeeId: feeId,
          FeeLocale: feeLocale,
          FeeCurrency: feeCurrency,
          FeeEntity: feeEntity,
          EntityProperty: entityProperty,
          FeeType: feeType,
          FeeFlat: feeFlat,
          FeePerc: feePerc,
          FeeValue: feeValue
        })
      })
      res.json({ message: 'Fee Configs successfully added.' })
    } catch (error) {
      console.log(error)
      res.status(500).json(error)
    }
  }
)

app.post(
  '/compute-transaction-fee',
  //passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const { ID, Amount, Currency, CurrencyCountry, Customer, PaymentEntity } =
      req.body

    let customer, type, issuer, brand, value, chargeAmount

    try {
      const transaction = await Transaction.create({
        ID,
        Amount,
        Currency,
        CurrencyCountry,
        Customer,
        PaymentEntity
      })

      customer = transaction.Customer
      paymentMethod = transaction.PaymentEntity
      type = transaction.PaymentEntity.Type
      brand = transaction.PaymentEntity.Brand
      issuer = transaction.PaymentEntity.Issuer

      console.log(customer, type, brand, issuer)

      paymentMethod.Country === transaction.CurrencyCountry
        ? (locale = 'LOCL')
        : (locale = 'INTL')

      const feeConfig = await Fee.findOne({
        $and: [
          {
            $or: [
              { EntityProperty: issuer },
              { EntityProperty: brand },
              { EntityProperty: '*' }
            ]
          },
          {
            $or: [{ FeeEntity: type }, { FeeEntity: '*' }]
          },
          {
            $or: [
              { FeeLocale: 'LOCL' },
              { FeeLocale: 'INTL' },
              { FeeLocale: '*' }
            ]
          },
          { FeeCurrency: Currency }
        ]
      }).cache(1800)

      console.log(feeConfig)

      !feeConfig &&
        res.status(400).json({
          error: 'No valid configuration exists for this payment method.'
        })

      feeConfig.FeeType === 'FLAT'
        ? (value = feeConfig.FeeFlat)
        : feeConfig.FeeType === 'PERC'
        ? (value =
            (feeConfig.FeePerc * +parseFloat(transaction.Amount).toFixed(2)) /
            100)
        : (value =
            feeConfig.FeeFlat +
            (feeConfig.FeePerc * +parseFloat(transaction.Amount).toFixed(2)) /
              100)

      chargeAmount = customer.BearsFee
        ? +(parseFloat(transaction.Amount) + value).toFixed(2)
        : +parseFloat(transaction.Amount).toFixed(2)

      res.json({
        AppliedFeeID: feeConfig.FeeId,
        AppliedFeeValue: value,
        ChargeAmount: chargeAmount,
        SettlementAmount: chargeAmount - value
      })
    } catch (error) {
      console.log(error)
      res.status(500).json(error)
    }
  }
)

app.listen(port, () => console.log('Server started successfully.'))
