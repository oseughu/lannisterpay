//Require all the necessary modules
require('dotenv').config()
const express = require('express')
const app = express()
const session = require('express-session')
const port = process.env.PORT || 3000
const passport = require('passport')
const jwt = require('jsonwebtoken')
require('./auth/passport')

const { sequelize, Customer, Transaction, PaymentEntity } = require('./models')

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true
  })
)

app.post('/login', async (req, res) => {
  const { email, password } = req.body

  const customer = await Customer.findOne({ where: { email } })

  try {
    if (!customer) {
      return res.json({ message: 'Email or password does not match!' })
    } else if (customer.password != password) {
      return res.json({ message: 'Email or password does not match!' })
    } else {
      const jwtToken = jwt.sign(
        { id: customer.id, email: customer.email },
        process.env.SECRET
      )
      return res.json({
        msg: 'Welcome to Lannister Pay!!',
        token: jwtToken
      })
    }
  } catch (err) {
    console.log(err)
    return res.status(500).json(err)
  }
})

app.post('/sign-up', async (req, res) => {
  const { full_name, email, password, bears_fee } = req.body

  const alreadyExists = await Customer.findOne({ where: { email } })

  try {
    if (alreadyExists) {
      return res.json({ error: 'User already exists. Log in instead.' })
    } else {
      const newUser = new Customer({
        full_name,
        email,
        password,
        bears_fee
      })
      await newUser.save()
      return res.json(newUser)
    }
  } catch (err) {
    console.log(err)
    return res.status(500).json(err)
  }
})

app.get(
  '/customer/:uuid',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const uuid = req.params.uuid

    try {
      const user = await Customer.findOne({
        where: { uuid },
        include: ['transactions', 'payment_entities']
      })

      return res.json(user)
    } catch (err) {
      console.log(err)
      return res.status(500).json({ error: 'Something went wrong.' })
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
        brand,
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
  '/compute-transaction-fee',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const { paymentEntityUuid, amount, currency, currency_country } = req.body

    let feeConfig
    let appliedFee
    let ChargeAmount
    let SettlementAmount

    try {
      const paymentMethod = await PaymentEntity.findOne({
        where: { uuid: paymentEntityUuid }
      })
      const customer = await Customer.findOne({
        where: { id: paymentMethod.customerId }
      })
      const transaction = new Transaction({
        paymentEntityId: paymentMethod.id,
        amount,
        currency,
        currency_country
      })
      await transaction.save()

      const perc = n => {
        return (n * transaction.amount) / 100
      }

      const flatPerc = (flat, n) => {
        return flat + (n * transaction.amount) / 100
      }

      if (
        transaction.currency_country === 'NG' &&
        transaction.currency === 'NGN' &&
        paymentMethod.type === 'CREDIT-CARD'
      ) {
        feeConfig = 'LNPY1221'
        appliedFee = perc(1.4)
      } else if (
        transaction.currency_country !== 'NG' &&
        transaction.currency === 'NGN' &&
        paymentMethod.brand === 'MASTERCARD' &&
        paymentMethod.type === 'CREDIT-CARD'
      ) {
        feeConfig = 'LNPY1222'
        appliedFee = perc(3.8)
      } else if (
        transaction.currency_country !== 'NG' &&
        transaction.currency === 'NGN' &&
        paymentMethod.type === 'CREDIT-CARD'
      ) {
        feeConfig = 'LNPY1223'
        appliedFee = perc(5.8)
      } else if (
        transaction.currency_country === 'NG' &&
        transaction.currency === 'NGN' &&
        paymentMethod.type === 'USSD' &&
        paymentMethod.brand === 'MTN'
      ) {
        feeConfig = 'LNPY1224'
        appliedFee = flatPerc(20, 0.5)
      } else if (
        transaction.currency_country === 'NG' &&
        transaction.currency === 'NGN' &&
        paymentMethod.type === 'USSD'
      ) {
        feeConfig = 'LNPY1225'
        appliedFee = flatPerc(20, 0.5)
      } else {
        return res.json({
          error: 'No valid configuration exists for this payment entity.'
        })
      }

      if (customer.bears_fee === true) {
        ChargeAmount = parseFloat(transaction.amount) + parseFloat(appliedFee)
        SettlementAmount = ChargeAmount - appliedFee
      } else {
        ChargeAmount = parseFloat(transaction.amount)
        SettlementAmount = ChargeAmount - appliedFee
      }

      return res.json({
        AppliedFeeID: feeConfig,
        AppliedFeeValue: appliedFee,
        ChargeAmount,
        SettlementAmount
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
