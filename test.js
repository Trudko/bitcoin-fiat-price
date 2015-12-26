var chai = require('chai');
    expect = chai.expect,
    chaiAsPromised = require('chai-as-promised'),
    sinon = require('sinon'),
    blockExplorer = require('blockchain.info/blockexplorer');

var BitcoinTransactionPrice = require('./index');

describe('Get price function', function() {
  var sandbox, blockExplorerStub;

  beforeEach(function(){
    sandbox = sinon.sandbox.create();
    blockExplorerStub = sandbox.stub(blockExplorer, 'getTx');
  });

  afterEach(function(){
    sandbox.restore();
  });

  it('Should return value of transaction', function(done) {
   var blockExplorerStubResolveValue = {
      inputs:[{
         prev_out: {value: 76521777}
      }],
      out: [
        {
          value: 74520777,
        }, {
          value: 2000000,
        }
      ],
      time: 1437205525
    };

    var expectedResult = {
      inputs: [ 0.76521777 ],
      outputs: [ 0.74520777, 0.02 ],
      fee: 0.00001,
      inputsInFiat: [ 210.05 ],
      outputsFiat: [ 204.55, 5.49 ],
      feeFiat: 0.0027449380000000006,
      bitcoinPriceFiat: 274.4938,
      currency: 'USD'
    }


    blockExplorerStub.returns(Promise.resolve(blockExplorerStubResolveValue));
    bitcoinTransactionPrice = new BitcoinTransactionPrice();

    return bitcoinTransactionPrice.getFiatPrice(95035819).then(function(obj) {
      expect(obj).to.deep.equal(expectedResult);
      done();
    }).catch(done);
  });
});
