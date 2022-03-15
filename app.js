//Require all the necessary modules
require('dotenv').config()
var _ = require('lodash')
const express = require('express')
const app = express()
const session = require('express-session')
const port = process.env.PORT || 3000
const passport = require('passport')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const saltRounds = 10
require('./auth/passport')

const {
  sequelize,
  Customer,
  Transaction,
  PaymentEntity,
  Fee
} = require('./models')

const Op = sequelize.Op

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true
  })
)

app.post('/register', async (req, res) => {
  const { fullName, email, password, bearsFee } = req.body

  try {
    const alreadyExists = await Customer.findOne({ where: { email } })
    if (alreadyExists) {
      return res.status(400).json({ Error: 'User already exists.' })
    } else {
      bcrypt.hash(password, saltRounds, (err, hash) => {
        const newUser = new Customer({
          full_name: fullName,
          email,
          password: hash,
          bears_fee: bearsFee
        })
        newUser.save()
        return res.json(newUser)
      })
    }
  } catch (error) {
    console.log(error)
    return res.status(500).json(error)
  }
})

// app.post('/login', async (req, res) => {
//   const { email, password } = req.body

//   const customer = await Customer.findOne({ where: { email } })

//   try {
//     if (customer) {
//       bcrypt.compare(password, customer.password, (err, result) => {
//         if (result) {
//           jwt.sign(
//             { id: customer.id, email: customer.email },
//             process.env.SECRET
//           )

//           return res.json({
//             msg: 'Welcome to Lannister Pay!!'
//             // token: jwtToken
//           })
//         } else {
//           return res
//             .status(400)
//             .json({ Error: 'Email or password does not match!' })
//         }
//       })
//     } else {
//       return res
//         .status(400)
//         .json({ Error: 'Email or password does not match!' })
//     }
//   } catch (error) {
//     console.log(error)
//     return res.status(500).json(error)
//   }
// })

app.get(
  '/customer/:uuid',
  //passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const uuid = req.params.uuid

    try {
      const customer = await Customer.findOne({
        where: { uuid },
        include: ['transactions', 'payment_entities']
      })

      return res.json(customer)
    } catch (err) {
      console.log(err)
      return res.status(500).json({ Error: 'Something went wrong.' })
    }
  }
)

app.post(
  '/add-payment-method',
  // passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const { customerUuid, issuer, type, brand, country, number, sixId } =
      req.body

    try {
      const customer = await Customer.findOne({
        where: { uuid: customerUuid }
      })
      const paymentEntity = new PaymentEntity({
        customerId: customer.id,
        issuer, //GTBANK, MTN
        type,
        brand, //optional, MASTERCARD, VISA
        country,
        number, //credit card or phone number
        six_id: sixId //last six digits of credit card, can be null for phone number
      })
      await paymentEntity.save()
      return res.json(paymentEntity)
    } catch (err) {
      console.log(err)
      return res.status(500).json(err)
    }
  }
)

app.post(
  '/fees',
  // passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const {
      feeId,
      feeLocale,
      feeCurrency,
      feeEntity, //CREDIT-CARD, DEBIT-CARD, BANK-ACCOUNT, USSD
      entityProperty, //optional, MASTERCARD, VISA, MTN, GTBANK
      feeType, //flat, perc or flat perc
      feeFlat, //optional, default is 0
      feeValue
    } = req.body

    try {
      const fee = new Fee({
        fee_id: feeId,
        fee_locale: feeLocale,
        fee_currency: feeCurrency,
        fee_entity: feeEntity,
        entity_property: entityProperty,
        fee_type: feeType,
        fee_flat: feeFlat,
        fee_value: feeValue
      })
      await fee.save()
      return res.json(fee)
    } catch (err) {
      console.log(err)
      return res.status(500).json(err)
    }
  }
)

app.post(
  '/compute-transaction-fee',
  //passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const { paymentEntityUuid, amount, currency } = req.body

    let ChargeAmount

    try {
      const paymentMethod = await PaymentEntity.findOne({
        where: { uuid: paymentEntityUuid }
      })

      const customer = await Customer.findOne({
        where: { id: paymentMethod.customerId }
      })

      const feeConfig = await Fee.findOne({
        where: {
          [Op.or]: [
            {
              fee_currency: currency,
              [Op.ne]: { fee_locale: 'INTL' },
              fee_entity: _.toUpper(_.kebabCase(paymentMethod.type)),
              entity_property: paymentMethod.brand || paymentMethod.issuer
            },
            {
              fee_currency: currency,
              [Op.ne]: { fee_locale: 'INTL' },
              fee_entity: _.toUpper(_.kebabCase(paymentMethod.type))
            },
            {
              [Op.ne]: { fee_currency: currency, fee_locale: 'LOCL' },
              fee_entity: _.toUpper(_.kebabCase(paymentMethod.type)),
              entity_property: paymentMethod.brand || paymentMethod.issuer
            },
            {
              [Op.ne]: { fee_currency: currency, fee_locale: 'LOCL' },
              fee_entity: _.toUpper(_.kebabCase(paymentMethod.type))
            }
          ]
        }
      })

      if (!feeConfig) {
        return res.status(400).json({
          Error: 'No valid configuration exists for this payment entity.'
        })
      }

      const transaction = new Transaction({
        paymentEntityId: paymentMethod.id,
        amount,
        currency
      })
      await transaction.save()

      const appliedFee = () => {
        if (_.lowerCase(feeConfig.fee_type) === 'flat') {
          return transaction.amount + feeConfig.fee_flat
        } else if (_.lowerCase(feeConfig.fee_type) === 'perc') {
          return (feeConfig.fee_value * transaction.amount) / 100
        } else if (_.lowerCase(feeConfig.fee_type) === 'flat perc') {
          return (
            feeConfig.fee_flat +
            (feeConfig.fee_value * transaction.amount) / 100
          )
        } else {
          return res.status(400).json({
            Error: 'No valid configuration exists for this payment entity.'
          })
        }
      }

      customer.bears_fee
        ? (ChargeAmount =
            parseFloat(transaction.amount) + parseFloat(appliedFee))
        : (ChargeAmount = transaction.amount)

      return res.json({
        AppliedFeeID: feeConfig.fee_id,
        AppliedFeeValue: appliedFee,
        ChargeAmount,
        SettlementAmount: ChargeAmount - appliedFee
      })
    } catch (err) {
      console.log(err)
      return res.status(500).json(err)
    }
  }
)

app.get(
  '/:uuid/transactions',
  //passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const customerUuid = req.params.uuid

    try {
      const customer = await Customer.findOne({
        where: { uuid: customerUuid }
      })
      const transactions = await Transaction.findAll({
        where: { customerId: customer.id },
        include: ['payment_method']
      })
      return res.json(transactions)
    } catch (err) {
      console.log(err)
      return res.status(500).json({ error: 'Something went wrong.' })
    }
  }
)

app.listen(port, async () => {
  console.log('Server started successfully!')
  await sequelize.authenticate()
  console.log('Database connected!')
})
