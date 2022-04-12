import { Fee } from '#models/fee'
import { Transaction } from '#models/transaction'
import { pipeline } from '#helpers/pipeline'

export const transactionController = async (req, res) => {
  const { ID, Amount, Currency, CurrencyCountry, Customer, PaymentEntity } =
    req.body

  let customer,
    paymentMethod,
    locale,
    type,
    brand,
    issuer,
    number,
    sixId,
    value,
    chargeAmount

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
    brand = paymentMethod.Brand
    issuer = paymentMethod.Issuer
    number = paymentMethod.Number
    sixId = paymentMethod.SixID

    paymentMethod.Country === transaction.CurrencyCountry
      ? (locale = 'LOCL')
      : (locale = 'INTL')

    const feeConfig = await Fee.aggregate(pipeline)

    feeConfig.length === 0 &&
      res.status(400).json({
        error: 'No valid configuration exists for this payment method.'
      })

    feeConfig[0].FeeType === 'FLAT'
      ? (value = feeConfig[0].FeeFlat)
      : feeConfig[0].FeeType === 'PERC'
      ? (value =
          (feeConfig[0].FeePerc * +parseFloat(transaction.Amount).toFixed(2)) /
          100)
      : (value =
          feeConfig[0].FeeFlat +
          (feeConfig[0].FeePerc * +parseFloat(transaction.Amount).toFixed(2)) /
            100)

    chargeAmount = customer.BearsFee
      ? +(parseFloat(transaction.Amount) + value).toFixed(2)
      : +parseFloat(transaction.Amount).toFixed(2)

    res.json({
      AppliedFeeID: feeConfig[0].FeeId,
      AppliedFeeValue: value,
      ChargeAmount: chargeAmount,
      SettlementAmount: chargeAmount - value
    })
  } catch (error) {
    res.status(500).json({ error: 'An error occurred with this transaction.' })
  }
}
