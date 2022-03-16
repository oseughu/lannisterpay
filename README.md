# Flutterwave Backend Engineer Assessment

This api was built to compute transaction fees using specific configurations. Built with Node, Express, MySQL2, and Sequelize. Hosted on Heroku and Clever Cloud.

NB: All request fields labelled optional (that you don't intend to fill) should be excluded from the request altogether, not left blank.

## Please start by signing up with the following details in the request:

https://lannpay.herokuapp.com/register

- fullName
- email
- bearsFee (true or false)

Please copy your unique user identifier (uuid) and keep it handy as you cannot add a payment entity or make a transaction without it. If you lose it, just sign up again with a different email, it doesn't have to be a real one, just valid email syntax.

## Add a payment method by filling in the following fields (urlencoded or json, both work):

https://lannpay.herokuapp.com/add-payment-method

- customerUuid (your uuid)
- issuer (GTBANK, MTN)
- type (CREDIT-CARD, DEBIT-CARD, USSD)
- brand (optional, MASTERCARD, VISA)
- country (NG, US, UK)
- number (credit card or phone number)
- sixId (last six digits of credit/debit card)

the uuid for each payment entity is returned after it has been added successfully, note this down too.

## To Add a new fee configuration specification, you need to fill the following fields:

https://lannpay.herokuapp.com/fees

- feeId (8 alphanumeric characters in the format "LNPY1234")
- feeLocale (LOCL or INTL)
- feeCurrency (NGN, USD, GBP)
- feeEntity (CREDIT-CARD, DEBIT-CARD, BANK-ACCOUNT, USSD)
- entityProperty (optional, MASTERCARD, VISA, MTN, GTBANK)
- feeType (FLAT, PERC OR FLAT PERC)
- feeFlat (optional, flat amount to be added if feeType is FLAT or FLAT PERC)
- feeValue (amount to be charged for the transaction fee, can be decimal)

## And finally, to compute your transaction fee, you only need three fields:

https://lannpay.herokuapp.com/compute-transaction-fee

- paymentEntityUuid (uuid for your preferred payment method, this is different from the user uuid so be careful.)
- amount (cost of the transaction)
- currency (NGN, USD, GBP)
