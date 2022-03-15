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

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true
  })
)

app.post('/sign-up', async (req, res) => {
  const { full_name, email, password, bears_fee } = req.body

  try {
    const alreadyExists = await Customer.findOne({ where: { email } })
    if (alreadyExists) {
      return res
        .status(400)
        .json({ Error: 'User already exists. Log in instead.' })
    } else {
      bcrypt.hash(password, saltRounds, (err, hash) => {
        const newUser = new Customer({
          full_name,
          email,
          password: hash,
          bears_fee
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

app.post('/login', async (req, res) => {
  const { email, password } = req.body

  const customer = await Customer.findOne({ where: { email } })

  try {
    if (customer) {
      bcrypt.compare(password, customer.password, (err, result) => {
        if (result) {
          const jwtToken = jwt.sign(
            { id: customer.id, email: customer.email },
            process.env.SECRET
          )

          const tokenUrl = 'https://lannpay.herokuapp.com/login'

          const getTokenRequest = {
            method: 'POST',
            url: tokenUrl,
            body: {
              mode: 'formdata',
              formdata: [
                { key: 'grant_type', value: jwtToken },
                { key: 'client_id', value: customer.id },
                { key: 'client_secret', value: process.env.SECRET }
              ]
            }
          }

          pm.sendRequest(getTokenRequest, (err, response) => {
            const jsonResponse = response.json()
            const newAccessToken = jsonResponse.access_token

            pm.variables.set('access_token', newAccessToken)
          })

          return res.json({
            msg: 'Welcome to Lannister Pay!!'
            // token: jwtToken
          })
        } else {
          return res
            .status(400)
            .json({ Error: 'Email or password does not match!' })
        }
      })
    } else {
      return res
        .status(400)
        .json({ Error: 'Email or password does not match!' })
    }
  } catch (error) {
    console.log(error)
    return res.status(500).json(error)
  }
})

app.get(
  '/customer/:id',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const id = req.params.id

    try {
      const user = await Customer.findOne({
        where: { id },
        include: ['transactions', 'payment_entities']
      })

      return res.json(user)
    } catch (err) {
      console.log(err)
      return res.status(500).json({ Error: 'Something went wrong.' })
    }
  }
)

app.post(
  '/add-payment-method',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const { userUuid, issuer, brand, number, six_id, type, country } = req.body

    try {
      const customer = await Customer.findOne({
        where: { uuid: userUuid }
      })
      const paymentEntity = new PaymentEntity({
        customerId: customer.id,
        issuer,
        brand, //optional
        number,
        six_id,
        type,
        country
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
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const {
      fee_id,
      fee_currency,
      fee_locale,
      fee_entity,
      entity_property, //optional
      fee_type, //flat, perc or flat perc
      fee_flat, //optional
      fee_value
    } = req.body

    try {
      const fee = new Fee({
        fee_id,
        fee_currency,
        fee_locale,
        fee_entity,
        entity_property,
        fee_type,
        fee_flat,
        fee_value
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
  passport.authenticate('jwt', { session: false }),
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
          fee_currency: currency,
          entity_property: paymentMethod.brand,
          fee_entity: _.toUpper(_.kebabCase(paymentMethod.type))
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
  passport.authenticate('jwt', { session: false }),
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
