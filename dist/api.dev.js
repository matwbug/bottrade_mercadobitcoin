"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var axios = require('axios');

var qs = require('querystring');

var crypto = require('crypto');

var ENDPOINT_API = "https://www.mercadobitcoin.net/api/";
var ENDPOINT_TRADE_API = "https://www.mercadobitcoin.net/tapi/v3/";
var ENDPOINT_TRADE_PATH = "/tapi/v3/";

var MercadoBitcoinTrade =
/*#__PURE__*/
function () {
  function MercadoBitcoinTrade(config) {
    _classCallCheck(this, MercadoBitcoinTrade);

    this.config = {
      KEY: config.key,
      SECRET: config.secret,
      CURRENCY: config.currency
    };
  }

  _createClass(MercadoBitcoinTrade, [{
    key: "getAccountInfo",
    value: function getAccountInfo() {
      return this.call('get_account_info', {});
    }
  }, {
    key: "placeBuyOrder",
    value: function placeBuyOrder(qty, limit_price) {
      return this.call('place_buy_order', {
        coin_pair: "".concat(process.env.currency).concat(this.config.CURRENCY),
        quantity: "".concat(qty).substr(0, 10),
        limit_price: "".concat(limit_price)
      });
    }
  }, {
    key: "placeSellOrder",
    value: function placeSellOrder(qty, limit_price) {
      return this.call('place_sell_order', {
        coin_pair: "".concat(process.env.currency).concat(this.config.CURRENCY),
        quantity: "".concat(qty).substr(0, 10),
        limit_price: "".concat(limit_price)
      });
    }
  }, {
    key: "call",
    value: function call(method, params) {
      var now, queryStr, signature, config, response;
      return regeneratorRuntime.async(function call$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              now = new Date().getTime();
              queryStr = qs.stringify({
                tapi_method: method,
                tapi_nonce: now
              }); //console.log(queryStr)

              if (params) queryStr += "&".concat(qs.stringify(params));
              signature = crypto.createHmac('sha512', this.config.SECRET).update("".concat(ENDPOINT_TRADE_PATH, "?").concat(queryStr)).digest('hex');
              config = {
                headers: {
                  'TAPI-ID': this.config.KEY,
                  'TAPI-MAC': signature
                }
              };
              _context.next = 7;
              return regeneratorRuntime.awrap(axios.post(ENDPOINT_TRADE_API, queryStr, config));

            case 7:
              response = _context.sent;

              if (!response.data.error_message) {
                _context.next = 10;
                break;
              }

              throw new Error(response.data.error_message);

            case 10:
              return _context.abrupt("return", response.data.response_data);

            case 11:
            case "end":
              return _context.stop();
          }
        }
      }, null, this);
    }
  }]);

  return MercadoBitcoinTrade;
}();

var MercadoBitcoin =
/*#__PURE__*/
function () {
  function MercadoBitcoin(config) {
    _classCallCheck(this, MercadoBitcoin);

    this.config = {
      CURRENCY: config.currency
    };
  }

  _createClass(MercadoBitcoin, [{
    key: "ticker",
    value: function ticker() {
      return this.call('ticker');
    }
  }, {
    key: "call",
    value: function call(method) {
      var config, response;
      return regeneratorRuntime.async(function call$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              config = {
                headers: {
                  'Accept': 'application/json'
                }
              };
              _context2.prev = 1;
              _context2.next = 4;
              return regeneratorRuntime.awrap(axios.get(ENDPOINT_API + this.config.CURRENCY + '/' + method));

            case 4:
              response = _context2.sent;
              return _context2.abrupt("return", response.data);

            case 8:
              _context2.prev = 8;
              _context2.t0 = _context2["catch"](1);
              console.log(_context2.t0);
              return _context2.abrupt("return", false);

            case 12:
            case "end":
              return _context2.stop();
          }
        }
      }, null, this, [[1, 8]]);
    }
  }]);

  return MercadoBitcoin;
}();

module.exports = {
  MercadoBitcoin: MercadoBitcoin,
  MercadoBitcoinTrade: MercadoBitcoinTrade
};