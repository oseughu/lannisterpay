//Require all the necessary modules
require('dotenv').config()
var _ = require('lodash')
const compression = require('compression')
const express = require('express')
const app = express()
const port = process.env.PORT || 3000
//const passport = require('passport')
//const jwt = require('jsonwebtoken')
//const bcrypt = require('bcrypt')
//const saltRounds = 10
//require('./auth/passport')

const {
  sequelize,
  Customer,
  Transaction,
  PaymentEntity,
  Fee
} = require('./models')

app.use(compression())
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// app.use(
//   session({
//     secret: process.env.SECRET,
//     resave: false,
//     saveUninitialized: true
//   })
// )

app.post('/register', async (req, res) => {
  const { fullName, email, /*password,*/ bearsFee } = req.body

  try {
    const alreadyExists = await Customer.findOne({ where: { email } })
    if (alreadyExists) {
      return res.status(400).json({ error: 'User already exists.' })
    } else {
      // bcrypt.hash(password, saltRounds, (err, hash) => {
      const newUser = new Customer({
        full_name: fullName,
        email,
        bears_fee: bearsFee
      })
      newUser.save()
      return res.json(newUser)
      //})
    }
  } catch (error) {
    //console.log(error)
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

// app.get(
//   '/customer/:uuid',
//   //passport.authenticate('jwt', { session: false }),
//   async (req, res) => {
//     const uuid = req.params.uuid

//     try {
//       const customer = await Customer.findOne({
//         where: { uuid },
//         include: ['transactions', 'payment_entities']
//       })

//       return res.json(customer)
//     } catch (error) {
//       //console.log(error)
//       return res.status(500).json({ error: 'User not found.' })
//     }
//   }
// )

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
        issuer, //optional, GTBANK, MTN
        type, //optional, USSD, CREDIT-CARD, BANK-ACCOUNT
        brand, //optional, MASTERCARD, VISA
        country, //optional, NG
        number, //card or phone number
        six_id: sixId //last six digits of card or phone number
      })
      await paymentEntity.save()
      return res.json(paymentEntity)
    } catch (error) {
      // console.log(error)
      return res.status(500).json(error)
    }
  }
)

app.post(
  '/fees',
  // passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const {
      feeId,
      feeLocale, //optional, LOCL or INTL
      feeCurrency,
      feeEntity, //optional, CREDIT-CARD, DEBIT-CARD, BANK-ACCOUNT, USSD
      entityProperty, //optional, MASTERCARD, VISA, MTN, GTBANK
      feeType, //FLAT, PERC OR FLAT PERC
      feeFlat, //optional, flat amount to be added if feeType is FLAT or FLAT PERC
      feeValue //optional, amount to be charged for the transaction fee, can be decimal
    } = req.body

    try {
      const alreadyExists = await Fee.findOne({ where: { fee_id: feeId } })

      if (alreadyExists) {
        return res.status(400).json({
          Error:
            'A fee config with that ID already exists. Please rename it and try again.'
        })
      } else {
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
      }
    } catch (error) {
      //console.log(error)
      return res.status(500).json(error)
    }
  }
)

app.post(
  '/compute-transaction-fee',
  //passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const { paymentEntityUuid, amount, currency, currencyCountry } = req.body

    let locale
    let type
    let property

    try {
      const paymentMethod = await PaymentEntity.findOne({
        where: { uuid: paymentEntityUuid }
      })

      const customer = await Customer.findOne({
        where: { id: paymentMethod.customerId }
      })

      if (paymentMethod.country === null) {
        locale = '*'
      } else if (paymentMethod.country === currencyCountry) {
        locale = 'LOCL'
      } else {
        locale = 'INTL'
      }

      if (paymentMethod.type === null) {
        type = '*'
      } else {
        type = _.toUpper(_.kebabCase(paymentMethod.type))
      }

      if (paymentMethod.brand === null && paymentMethod.issuer === null) {
        property = '*'
      } else if (paymentMethod.brand === null) {
        property = _.upperCase(paymentMethod.issuer)
      } else {
        property = _.upperCase(paymentMethod.brand)
      }

      const feeConfig = await Fee.findOne({
        where: {
          fee_currency: currency,
          fee_locale: locale,
          fee_entity: type,
          entity_property: property
        }
      })

      !feeConfig &&
        res.status(400).json({
          error: 'No valid configuration exists for this payment method.'
        })

      const transaction = new Transaction({
        paymentEntityId: paymentMethod.id,
        amount,
        currency,
        currency_country: currencyCountry
      })
      await transaction.save()

      const appliedFee = () => {
        if (_.upperCase(feeConfig.fee_type) === 'FLAT') {
          return +(
            parseFloat(transaction.amount) + parseFloat(feeConfig.fee_flat)
          ).toFixed(2)
        } else if (_.upperCase(feeConfig.fee_type) === 'PERC') {
          return +(
            (parseFloat(feeConfig.fee_value) * parseFloat(transaction.amount)) /
            100
          ).toFixed(2)
        } else if (_.upperCase(feeConfig.fee_type) === 'FLAT PERC') {
          return +(
            parseFloat(feeConfig.fee_flat) +
            (parseFloat(feeConfig.fee_value) * parseFloat(transaction.amount)) /
              100
          ).toFixed(2)
        }
      }

      const chargeAmount = () =>
        customer.bears_fee
          ? parseFloat(transaction.amount) + parseFloat(appliedFee())
          : parseFloat(transaction.amount)

      return res.json({
        AppliedFeeID: feeConfig.fee_id,
        AppliedFeeValue: appliedFee(),
        ChargeAmount: chargeAmount(),
        SettlementAmount: chargeAmount() - appliedFee()
      })
    } catch (error) {
      //console.log(error)
      return res.status(500).json(error)
    }
  }
)

// app.get(
//   '/:uuid/transactions',
//   //passport.authenticate('jwt', { session: false }),
//   async (req, res) => {
//     const customerUuid = req.params.uuid

//     try {
//       const customer = await Customer.findOne({
//         where: { uuid: customerUuid }
//       })
//       const transactions = await Transaction.findAll({
//         where: { customerId: customer.id },
//         include: ['payment_method']
//       })
//       return res.json(transactions)
//     } catch (error) {
//       //console.log(error)
//       return res.status(500).json({
//         error: 'No transactions for this user or user does not exist.'
//       })
//     }
//   }
// )

app.listen(port, async () => {
  //console.log('Server started successfully!')
  await sequelize.authenticate()
  //console.log('Database connected!')
})
