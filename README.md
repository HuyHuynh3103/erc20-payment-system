The Payment ERC Project
==================

> A complete payment erc20 implementation and utilities in JavaScript (and TypeScript).

**Features:**

- changePrice function: change price of your erc20 token to any other erc20 token
- handlePayment function: handle payment of your erc20 token

Installing
----------
**Javascript/Typescript**
```
npm install --save erc20-payment-system
```
# ⚙️ Quick start
  - [`handlePayment`](#HandlePayment)
  - [`changePrice`](#changePrice)

## `handlePayment`
```js
const { handlePayment } = require('erc20-payment-system');
const {
    txHash,
    txApproveHash,
} = await handlePayment({
    _contractAddress,
    _tokenAddress,
    _value,
    _functionName,
    _args,
    _configs
})
```
## `changePrice`
```js
const { changePrice } = require('erc20-payment-system');
const {
    tokenBaseSymbol,
    tokenQuoteSymbol,
    baseValue
} = await changePrice({
    _chainId,
    _tokenBase,
    _tokenQuote,
    _initialValue
})
```

Documentation
-------------

License
-------

MIT License (including **all** dependencies).