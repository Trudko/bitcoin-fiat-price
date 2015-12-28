var chai = require('chai');
    expect = chai.expect,
    chaiAsPromised = require('chai-as-promised'),
    sinon = require('sinon'),
    blockExplorer = require('blockchain.info/blockexplorer'),
    nock = require('nock');

var bitcoinFiatPrice = require('./lib/bitcoinFiatPrice');

describe('Get address fiat balance', function() {

  it('Should return 300 for a given address', function (done) {
    nock('https://blockchain.info')
    .get('/q/addressbalance/12zpVdwFvv6imJkndpoNBaWikiyv3ksz3Y')
    .reply(200, 100000000);

    nock('https://api.coindesk.com')
    .get('/v1/bpi/currentprice/USD.json')
    .reply(200, {
      'bpi': {
          'USD': {
            'rate': 300
          }
      }
    });

    bitcoinFiatPrice.getAddressFiatBalance('12zpVdwFvv6imJkndpoNBaWikiyv3ksz3Y').then(function(result) {
      expect(result).to.equal(300);
      done();
    }).catch(done);
  })

  afterEach(function () {
    nock.enableNetConnect();
  })
});

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

    nock('https://api.coindesk.com')
    .get('/v1/bpi/historical/close.json?currency=USD&start=2015-07-18&end=2015-07-18')
    .reply(200, {
      'bpi': {
        '2015-07-18': 274.4938
      }
    });

    blockExplorerStub.returns(Promise.resolve(blockExplorerStubResolveValue));

    return bitcoinFiatPrice.getTransactionFiatPrice(95035819).then(function(obj) {
      expect(obj).to.deep.equal(expectedResult);
      done();
    }).catch(done);
  });
});
