require('dotenv').config()
import _ from 'lodash'
import compression from 'compression'
import express, { urlencoded, json } from 'express'
import Redis from 'ioredis'
import { Fee, Transaction } from './models/schema'

const redis = new Redis(`${process.env.REDIS_URL}`)
const app = express()
const port = process.env.PORT || 3000

app.use(compression())
app.use(urlencoded({ extended: true }))
app.use(json())

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

    let newArr = FeeConfigurationSpec.split('\n')

    newArr.forEach(spec => {
      let specArr = spec.split(' ')
      let feeArr = specArr[7].split(':')
      feeId = specArr[0]
      feeCurrency = specArr[1]
      feeLocale = specArr[2]
      feeEntity = specArr[3]
      entityProperty = specArr[4]
      feeType = specArr[6]
      feeFlat = +parseFloat(feeArr[0]).toFixed(2) || 0
      feePerc = +parseFloat(feeArr[1]).toFixed(2) || 0
      feeValue =
        feeType === 'FLAT_PERC'
          ? `${feeFlat}:${feePerc}`
          : feeType === 'FLAT'
          ? feeFlat
          : feePerc
    })

    try {
      const fee = new Fee({
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
      await fee.save()
      res.json(fee)
    } catch (error) {
      //console.log(error)
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

    let customer, paymentMethod, locale, type, property, value, chargeAmount

    try {
      const transaction = new Transaction({
        ID,
        Amount,
        Currency,
        CurrencyCountry,
        Customer,
        PaymentEntity
      })
      await transaction.save()

      customer = transaction.Customer

      paymentMethod = transaction.PaymentEntity

      paymentMethod.Country === CurrencyCountry
        ? (locale = 'LOCL')
        : (locale = 'INTL')

      type = _.toUpper(_.kebabCase(paymentMethod.Type))

      property = _.upperCase(paymentMethod.Brand)

      const feeConfig = await Fee.findOne({
        where: {
          FeeCurrency: Currency,
          FeeLocale: locale,
          FeeEntity: type,
          EntityProperty: property
        }
      })

      !feeConfig &&
        res.status(400).json({
          error: 'No valid configuration exists for this payment method.'
        })

      if (_.upperCase(feeConfig.FeeType) === 'FLAT') {
        value = feeConfig.FeeFlat
      } else if (_.upperCase(feeConfig.FeeType) === 'PERC') {
        value =
          (feeConfig.FeePerc * +parseFloat(transaction.Amount).toFixed(2)) / 100
      } else if (_.upperCase(feeConfig.FeeType) === 'FLAT_PERC') {
        value =
          feeConfig.FeeFlat +
          (feeConfig.FeePerc * +parseFloat(transaction.Amount).toFixed(2)) / 100
      }

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
      //console.log(error)
      res.status(500).json(error)
    }
  }
)

app.listen(port, () => console.log('Server started successfully.'))
