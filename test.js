var chai = require('chai');
    expect = chai.expect,
    chaiAsPromised = require('chai-as-promised'),
    sinon = require('sinon'),
    blockExplorer = require('blockchain.info/blockexplorer');

chai.use(chaiAsPromised);

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

    blockExplorerStub.returns(Promise.resolve(blockExplorerStubResolveValue));
    bitcoinTransactionPrice = new BitcoinTransactionPrice();

    bitcoinTransactionPrice.getPrice(95035819).then(function(obj) {
      expect(obj.inputs).to.deep.equal([0.76521777]);
      expect(obj.outputs).to.deep.equal([0.74520777, 0.02]);
      expect(obj.fee).to.equal(0.00001);
      expect(obj.inputsInFiat).to.deep.equal([211.360226]);
      expect(obj.outputsFiat).to.deep.equal([204.55, 5.49]);
      expect(obj.feeFiat).to.equal(0.0027449380000000006);
      expect(obj.bitcoinPriceFiat).to.equal(274.4938);
      expect(obj.currency).to.equal('USD');
      done();
    });
  });
});
