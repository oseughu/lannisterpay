import 'dotenv/config'
import pkg from 'mongoose'

const { Schema, connect, model } = pkg

connect(`${process.env.MONGO_URL}`, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
console.log('Connected to MongoDB')

const feeSchema = new Schema({
  FeeId: String,
  FeeLocale: String, //LOCL or INTL
  FeeCurrency: String,
  FeeEntity: String, //CREDIT-CARD, DEBIT-CARD, BANK-ACCOUNT, USSD
  EntityProperty: String, //MASTERCARD, VISA, MTN, GTBANK
  FeeType: String, //FLAT, PERC OR FLAT_PERC
  FeeFlat: Number,
  FeePerc: Number,
  FeeValue: String
})

const transactionSchema = new Schema({
  ID: Number,
  Amount: Number,
  Currency: String,
  CurrencyCountry: String,
  Customer: {
    ID: Number,
    EmailAddress: String,
    FullName: String,
    BearsFee: Boolean
  },
  PaymentEntity: {
    ID: Number,
    Issuer: String,
    Brand: String,
    Number: String,
    SixID: Number,
    Type: String,
    Country: String
  }
})

export const Fee = new model('Fee', feeSchema)
export const Transaction = new model('Transaction', transactionSchema)
