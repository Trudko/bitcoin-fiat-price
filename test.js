var chai = require('chai');
    expect = chai.expect,
    chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);

var BitcoinTransactionPrice = require('./index');

describe('Get price function', function() {
  it('Should return value of transaction', function(done) {
    bitcoinTransactionPrice = new BitcoinTransactionPrice();
    bitcoinTransactionPrice.getPrice(95035819).then(function(obj) {
      expect(obj.inputs).to.deep.equal([0.76521777]);
      expect(obj.outputs).to.deep.equal([0.74520777, 0.02]);
      expect(obj.fee).to.equal(0.00001);
      done();
    });
  });
});
