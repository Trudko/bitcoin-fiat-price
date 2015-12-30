Returns the current value of bitcoin, value of a transaction or an address for a given fiat currency. Price of bitcoin used in calculation is provided by Coindesk API.

Still early version API might change.

# Available Functions

### getAddressBalance(addressHash, currencyCode)
Returns balance in fiat currency specified by currencyCode for given bitcoin address. If currencyCode is empty, it defaults to USD.

### getCurrentPrice(currencyCode)
Returns current price of 1 bitcoin in fiat currency specified by currencyCode(default value USD). If currencyCode is empty, it defaults to USD.

### getTransactionPrice(trxID, currencyCode)
Returns object with few informations about transaction, specified by [txid - transaction identifier](https://bitcoin.org/en/developer-guide#block-chain-overview). Properties of object:

**iputs:** array of all inputs in bitcoin.

**outputs:** array of all outputs in bitcoin.

**fee:** original fee in bitcoin

**inputsFiat:** array of all inputs in fiat currency.

**outputsFiat:** array of all outputs in fiat currency.

**feeFiat:** fee in fiat currency without rounding up.

**bitcoinPriceFiat:** price of bitcoin used in calculations.

```javascript
Example of result used it test:
{
  inputs: [ 0.76521777 ],
  outputs: [ 0.74520777, 0.02 ],
  fee: 0.00001,
  inputsFiat: [ 210.05 ],
  outputsFiat: [ 204.55, 5.49 ],
  feeFiat: 0.0027449380000000006,
  bitcoinPriceFiat: 274.4938
}
```
