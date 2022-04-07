import 'dotenv/config'
import express from 'express'
import mongoose from 'mongoose'
import mongooseRedisCaching from 'mongoose-redis-caching'
import { Transaction } from '#models/transaction'

mongooseRedisCaching(mongoose)

export const transactionRouter = express.Router()

transactionRouter.post('/compute-transaction-fee', async (req, res) => {
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
    res.status(500).json({ error: 'An error occurred with this transaction.' })
  }
})
