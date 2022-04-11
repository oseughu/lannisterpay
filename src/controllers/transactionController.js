import { Fee } from '#models/fee'
import { Transaction } from '#models/transaction'

export const transactionController = async (req, res) => {
  const { ID, Amount, Currency, CurrencyCountry, Customer, PaymentEntity } =
    req.body

  let customer,
    paymentMethod,
    locale,
    type,
    brand,
    issuer,
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
    type = paymentMethod.Type
    brand = paymentMethod.Brand
    issuer = paymentMethod.Issuer
    sixId = paymentMethod.SixID

    paymentMethod.Country === transaction.CurrencyCountry
      ? (locale = 'LOCL')
      : (locale = 'INTL')

    const feeConfig = await Fee.findOne({
      FeeCurrency: { $in: [Currency] },
      FeeLocale: { $in: [locale, '*'] },
      FeeEntity: { $in: [type, '*'] },
      EntityProperty: { $in: [sixId, brand, issuer, '*'] }
    })

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
}
