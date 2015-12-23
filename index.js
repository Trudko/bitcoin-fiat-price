var blockExplorer = require('blockchain.info/blockexplorer');
var converter = require('satoshi-bitcoin');

var BitcoinTransactionPrice = function() {

  this.getPrice = function(trxID, currency) {
    return blockExplorer.getTx(trxID).then(function(value) {

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

    });
  }

}


module.exports = BitcoinTransactionPrice;
