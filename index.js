var blockExplorer = require('blockchain.info/blockexplorer');
var converter = require('satoshi-bitcoin');
var requestPromise = require('request-promise');

var BitcoinTransactionPrice = function() {

  this.getPrice = function(trxID, currency) {
    var currency = currency || 'USD';
    var transactionUTCtime = 0;

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

    }, function(error) {
      console.log(errror);
    }).then(function(value) {
      var transactionDate = new Date(transactionUTCtime);
      var transactionDateISO =  transactionDate.toISOString().split('T')[0];

      var url = 'https://api.coindesk.com/v1/bpi/historical/close.json?currency=' + currency + '&start=' + transactionDateISO + '&end=' + transactionDateISO;
      return requestPromise(url).then(function(marketData) {
          var obj = JSON.parse(marketData).bpi;
          var btcPriceInFiat = obj[Object.keys(obj)[0]];

          value.inputsInFiat = value.inputs.map(function(input) {
            return (btcPriceInFiat * input.toFixed(2));
          });

          value.outputsFiat = value.outputs.map(function(output) {
            return  (btcPriceInFiat * output).toFixed(2);
          });

          value.feeFiat = (btcPriceInFiat * value.fee);
          value.bitcoinPriceFiat = btcPriceInFiat;
          value.currency = currency;

          return value;
      });
    }).catch(function(error) {
        console.log(error.stack);
    });
  }

}

module.exports = BitcoinTransactionPrice;
