var blockExplorer = require('blockchain.info/blockexplorer'),
    converter = require('satoshi-bitcoin'),
    requestPromise = require('request-promise'),
    Big = require('big.js'),
    q = require('q');

var BitcoinFiatPrice = function() {
  var transactionUTCtime = 0;

  this.getAdressFiatBalance = function(addressHash, currency) {
    var currency = currency || 'USD';
    var that = this;

    return q.all([getAddressBitcoinBalance(addressHash), this.getCurrentFiatPrice(currency)])
    .spread(function(addressbalance, currentBitcoinPriceInFiat) {
      var bigWrapper = new Big(currentBitcoinPriceInFiat);
      return Number(bigWrapper.times(addressbalance).toFixed(2));
    })
    .catch(function(error) {
      console.log(error.stack);
    });
  }

  this.getCurrentFiatPrice = function(currency) {
    var currency = currency || 'USD',
        url = 'https://api.coindesk.com/v1/bpi/currentprice/' + currency + '.json';

    return requestPromise(url).then(function (priceData) {
      return JSON.parse(priceData).bpi[currency].rate;
    });
  }

  this.getFiatPrice = function(trxID, currency) {
    var currency = currency || 'USD';

    return getTransactionInfo(trxID).then(function(transactionInfo) {
      return getTransactionFiatValue(transactionInfo, currency).then(function(transactionInfo) {
          return transactionInfo;
      });
    }).catch(function(error) {
      console.log(error.stack);
    });
  }

  var getTransactionInfo = function(trxID) {
    return blockExplorer.getTx(trxID).then(function(value) {
      transactionUTCtime = Number.parseInt(value.time) * 1000;

      var transactionDetails = value,
          inputs = transactionDetails.inputs,
          outputs = transactionDetails.out;

      var totalInputsValue = inputs.reduce(function (input1, input2) {
        return input1.prev_out.value + input2.prev_out.value;
      }, {prev_out : { value: 0}});

      var totalOutputsValue = outputs.reduce(function (output1, output2) {
        return output1.value + output2.value;
      })

      inputs = inputs.map(function(input) {
        return converter.toBitcoin(input.prev_out.value);
      });

      outputs = outputs.map(function(output) {
        return converter.toBitcoin(output.value);
      });

      return {
          inputs: inputs,
          outputs: outputs,
          fee: converter.toBitcoin(totalInputsValue - totalOutputsValue)
      };
    });
  }

  var getAddressBitcoinBalance = function(addressHash) {
    var url = 'https://blockchain.info/q/addressbalance/' + addressHash;

    return requestPromise(url).then(function(walletBalanceInSatoshi) {
      return converter.toBitcoin(walletBalanceInSatoshi);
    });
  }

  var getTransactionFiatValue = function(transactionInfo, currency) {
    var transactionDate = new Date(transactionUTCtime),
        transactionDateISO =  transactionDate.toISOString().split('T')[0],
        url = 'https://api.coindesk.com/v1/bpi/historical/close.json?currency=' + currency + '&start=' + transactionDateISO + '&end=' + transactionDateISO;

    return requestPromise(url).then(function(marketData) {
        var obj = JSON.parse(marketData).bpi;
        var btcPriceInFiat = obj[Object.keys(obj)[0]];

        transactionInfo.inputsInFiat = transactionInfo.inputs.map(function(input) {
          var bigWrapper = new Big(btcPriceInFiat);
          return Number(bigWrapper.times(input).toFixed(2));
        });

        transactionInfo.outputsFiat = transactionInfo.outputs.map(function(output) {
          var bigWrapper = new Big(btcPriceInFiat);
          return Number(bigWrapper.times(output).toFixed(2));
        });

        transactionInfo.feeFiat = (btcPriceInFiat * transactionInfo.fee);
        transactionInfo.bitcoinPriceFiat = btcPriceInFiat;
        transactionInfo.currency = currency;

        return transactionInfo;
    });
  }
}

module.exports = BitcoinFiatPrice;
