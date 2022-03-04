"use strict";

require('dotenv-safe').config();

var _require = require('./api'),
    MercadoBitcoin = _require.MercadoBitcoin,
    MercadoBitcoinTrade = _require.MercadoBitcoinTrade;

var profit = process.env.PROFIT;
var currency = process.env.CURRENCY;
var coin = process.env.COIN;

var taapi = require("taapi");

var client = taapi.client(process.env.TAAPI_KEY);
var infoApi = new MercadoBitcoin({
  currency: coin
});
var tradeApi = new MercadoBitcoinTrade({
  currency: coin,
  key: process.env.KEY,
  secret: process.env.CHAVEAPI
});

function getQuantity(coin, price, isBuy) {
  var data, balance, qty;
  return regeneratorRuntime.async(function getQuantity$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          price = parseFloat(price);
          coin = isBuy ? 'brl' : coin.toLowerCase();
          _context.next = 4;
          return regeneratorRuntime.awrap(tradeApi.getAccountInfo());

        case 4:
          data = _context.sent;
          balance = parseFloat(data.balance[coin].available).toFixed(8);

          if (!(isBuy && balance < 0)) {
            _context.next = 8;
            break;
          }

          return _context.abrupt("return", false);

        case 8:
          qty = 0;
          if (isBuy) qty = parseFloat((balance / price).toFixed(8));
          return _context.abrupt("return", qty - 0.00001);

        case 11:
        case "end":
          return _context.stop();
      }
    }
  });
}

setInterval(function _callee() {
  var precoBom, response, qty, data, priceSell, sellOrder;
  return regeneratorRuntime.async(function _callee$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;

          precoBom = function precoBom() {
            var rsi;
            return regeneratorRuntime.async(function precoBom$(_context2) {
              while (1) {
                switch (_context2.prev = _context2.next) {
                  case 0:
                    _context2.next = 2;
                    return regeneratorRuntime.awrap(client.getIndicator("rsi", "binance", "".concat(process.env.COIN, "/").concat(process.env.CURRENCY), "30m"));

                  case 2:
                    rsi = _context2.sent;
                    console.log("O INDICADOR RSI EST\xC1 ".concat(rsi.value));

                    if (!(rsi.value > 0)) {
                      _context2.next = 6;
                      break;
                    }

                    return _context2.abrupt("return", false);

                  case 6:
                    return _context2.abrupt("return", true);

                  case 7:
                  case "end":
                    return _context2.stop();
                }
              }
            });
          };

          _context3.next = 4;
          return regeneratorRuntime.awrap(infoApi.ticker());

        case 4:
          response = _context3.sent;
          console.log("Maior pre\xE7o nas \xFAltimas 24 horas ".concat(response.ticker.high, "\nPre\xE7o atual: ").concat(response.ticker.sell));

          if (!precoBom()) {
            _context3.next = 8;
            break;
          }

          return _context3.abrupt("return", console.log('Tá muito caro pra comprar =('));

        case 8:
          _context3.next = 10;
          return regeneratorRuntime.awrap(getQuantity('BRL', response.ticker.sell, true));

        case 10:
          qty = _context3.sent;

          if (qty) {
            _context3.next = 13;
            break;
          }

          return _context3.abrupt("return", console.error("Saldo insuficiente pra comprar"));

        case 13:
          _context3.next = 15;
          return regeneratorRuntime.awrap(tradeApi.placeBuyOrder(qty, response.ticker.sell));

        case 15:
          data = _context3.sent;
          console.log("Sua ordem foi enviada!", data);

          if (!(data.status == 4)) {
            _context3.next = 23;
            break;
          }

          priceSell = parseFloat(data.limit_price * profit).toFixed(8);
          _context3.next = 21;
          return regeneratorRuntime.awrap(tradeApi.placeSellOrder(data.quantity - data.fee, priceSell));

        case 21:
          sellOrder = _context3.sent;
          console.log(sellOrder);

        case 23:
          _context3.next = 28;
          break;

        case 25:
          _context3.prev = 25;
          _context3.t0 = _context3["catch"](0);
          console.error(_context3.t0);

        case 28:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[0, 25]]);
}, process.env.EXEC_INTERVAL);