# Flutterwave Backend Engineer Assessment

This api was built to compute transaction fees using specific configurations. Built with Node, Express, MySQL2, and Sequelize. Hosted on Heroku and Clever Cloud.

## Please start by signing up with the following details in the request:

- fullName
- email
- password
- bearsFee (true or false)

Please copy your unique user identifier (uuid) and keep it handy as you cannot add a payment entity or make a transaction without it. If you lose it, just sign up again with a different email, it doesn't have to be a real one, just valid email syntax.

## Add a payment method by filling in the following fields (urlencoded or json, both work):

- customerUuid (your uuid)
- issuer (GTBANK, MTN)
- type (CREDIT-CARD, DEBIT-CARD, USSD)
- brand (optional, MASTERCARD, VISA)
- country (NG, US, UK)
- number (credit card or phone number)
- sixId (last six digits of credit/debit card)

the uuid for each payment entity is returned after it has been added successfully, note this down too.

## To Add a new fee configuration specification, you need to fill the following fields:

- feeId
- feeLocale
- feeCurrency
- feeEntity (CREDIT-CARD, DEBIT-CARD, BANK-ACCOUNT, USSD)
- entityProperty (optional, MASTERCARD, VISA, MTN, GTBANK)
- feeType (FLAT, PERC OR FLAT PERC)
- feeFlat (optional, default is 0)
- feeValue (amount to be charged for the transaction fee, can be decimal)

## And finally, to compute your transaction fee, you only need three fields:

- paymentEntityUuid (uuid for your preferred payment method, this is different from the user uuid so be careful.)
- amount (cost of the transaction)
- currency (NGN, USD, GBP)
