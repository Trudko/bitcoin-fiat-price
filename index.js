var blockExplorer = require('blockchain.info/blockexplorer');
var converter = require('satoshi-bitcoin');
var requestPromise = require('request-promise');
var Big = require('big.js');

var BitcoinTransactionPrice = function() {
  var transactionUTCtime = 0;

  this.getCurrentFiatPrice = function (currency) {
    var url = 'https://api.coindesk.com/v1/bpi/currentprice/' + currency + '.json';
    return requestPromise(url).then(function (priceData) {
      return JSON.parse(priceData).bpi[currency].rate;
    });
  }

  this.getFiatPrice = function(trxID, currency) {
    var currency = currency || 'USD';

    return getTransactionInfo(trxID).then(function(transactionInfo) {
      return getFiatValue(transactionInfo, currency).then(function(transactionInfo) {
          return transactionInfo;
      });
    }).catch(function(error) {
      console.log(error.stack);
    });
  }

  var getTransactionInfo = function(trxID) {
    return blockExplorer.getTx(trxID).then(function(value) {
      transactionUTCtime = Number.parseInt(value.time) * 1000;

      var transactionDetails = value;
      var inputs = transactionDetails.inputs;
      var outputs = transactionDetails.out;

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

      var fee = converter.toBitcoin(totalInputsValue - totalOutputsValue);

      return {
          inputs: inputs,
          outputs: outputs,
          fee: fee
      };
    });
  }

  var getFiatValue = function(transactionInfo, currency) {
    var transactionDate = new Date(transactionUTCtime);
    var transactionDateISO =  transactionDate.toISOString().split('T')[0];
    var url = 'https://api.coindesk.com/v1/bpi/historical/close.json?currency=' + currency + '&start=' + transactionDateISO + '&end=' + transactionDateISO;

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

module.exports = BitcoinTransactionPrice;
