(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _socket = require('../utils/socket');

var _socket2 = _interopRequireDefault(_socket);

var _ticker = require('./ticker');

var _ticker2 = _interopRequireDefault(_ticker);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_socket2.default.send('heineken');

var definition = {
	name: 'ticker-overview',

	components: {
		ticker: _ticker2.default
	},

	data: function data() {
		return {
			refreshInterval: 2000, // MS
			selectedSymbol: null,
			symbols: 'AAL, AAPL, ADBE, ADI, ADP, ADSK, AKAM, ALXN, AMAT, AMGN, AMZN, ATVI, AVGO, BIDU, BIIB, BMRN, CA, CELG, CERN, CHKP, CHTR, CTRP, CTAS, CSCO, CTXS, CMCSA, COST, CSX, CTSH, DISCA, DISCK, DISH, DLTR, EA, EBAY, ESRX, EXPE, FAST, FB, FISV, FOX, FOXA, GILD, GOOG, HAS, HSIC, HOLX, ILMN, INCY, INTC, INTU, ISRG, JD, KLAC, KHC, LBTYA, LILA, LILAK, LRCX, QVCA, LVNTA, MAR, MCHP, MDLZ, MNST, MSFT, MU, MXIM, MYL, NCLH, NFLX, NVDA, ORLY, PAYX, PCAR, PCLN, QCOM, REGN, ROST, SBAC, STX, SHPG, SIRI, SWKS, SYMC, TMUS, TRIP, TSCO, TSLA, TXN, ULTA, VIAB, VOD, VRSK, VRTX, WBA, WDC, XLNX, XRAY, YHOO'.split(', '),
			tickers: [{ symbol: 'AAPL', isExpanded: false }],

			quotes: {}
		};
	},


	computed: {
		tickerSymbols: function tickerSymbols() {
			return this.tickers.map(function (ticker) {
				return ticker.symbol;
			});
		}
	},

	watch: {
		tickers: function tickers() {
			this.subscribe();
		}
	},

	mounted: function mounted() {
		_socket2.default.socket.addEventListener('message', this.onSocketMessage);
		this.subscribe();
	},


	methods: {
		tickerExists: function tickerExists(symbol) {
			return this.tickers.filter(function (t) {
				return t.symbol === symbol;
			}).length !== 0;
		},
		onTickerSelected: function onTickerSelected() {
			this.addTicker(this.selectedSymbol);
			this.selectedSymbol = null;
		},
		onSocketMessage: function onSocketMessage(message) {
			console.log(message);
		},
		addTicker: function addTicker(symbol) {
			var isExpanded = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

			this.tickers.push({
				symbol: symbol,
				isExpanded: isExpanded
			});
		},
		remove: function remove(index) {
			this.tickers.splice(index, 1);
		},
		toggleExpanded: function toggleExpanded(index) {
			this.tickers[index].isExpanded = !this.tickers[index].isExpanded;
		},
		subscribe: function subscribe() {
			// this.fetchQuote();
		}
	}
};

exports.default = definition;

},{"../utils/socket":4,"./ticker":2}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
var states = {
	pending: 'pending',
	loading: 'loading'
};

var NA = '-';

var QUOTE_DEFAULT = {
	Bid: null,
	Ask: null,
	AverageDailyVolume: null,
	Currency: NA,
	DaysLow: NA,
	DaysHigh: NA,
	LastTradeDate: NA,
	LastTradePriceOnly: NA,
	Name: NA,
	MarketCapitalization: NA,
	EBITDA: NA
};

var definition = {
	template: '#template-ticker',
	name: 'ticker',

	components: {
		//
	},

	props: {
		index: { default: 0 },
		symbol: { default: null },
		isExpanded: { default: false },
		passedQuotes: { default: {} },
		refreshInterval: { default: 1000 } // in MS
	},

	data: function data() {
		return {
			state: states.pending,
			quoteTimeoutId: null,
			isPositiveTick: false,
			isNegativeTick: false
		};
	},


	computed: {
		quote: function quote() {
			return this.passedQuotes[this.symbol] || QUOTE_DEFAULT;
		},
		bid: function bid() {
			if (!this.quote.Bid) {
				return null;
			}

			return parseFloat(this.quote.Bid);
		},
		ask: function ask() {
			if (!this.quote.Ask) {
				return null;
			}

			return parseFloat(this.quote.Ask);
		},
		quoteMid: function quoteMid() {
			if (!this.bid || !this.ask) {
				return '-';
			}

			return ((this.bid + this.ask) * 0.5).toPrecision(6);
		},
		toggleButtonText: function toggleButtonText() {
			return this.isExpanded ? 'collapse' : 'expand';
		}
	},

	watch: {
		quoteMid: function quoteMid(newVal, oldVal) {
			if (!oldVal) {
				return;
			}

			this.resetTickStates();

			if (newVal > oldVal) {
				this.isPositiveTick = true;
			} else {
				this.isNegativeTick = true;
			}

			setTimeout(this.resetTickStates, 500);
		}
	},

	beforeDestroy: function beforeDestroy() {
		clearTimeout(this.quoteTimeoutId);
	},


	methods: {
		resetTickStates: function resetTickStates() {
			this.isPositiveTick = false;
			this.isNegativeTick = false;
		},
		toggleExpanded: function toggleExpanded() {
			this.$emit('toggle-expanded', this.index);
		},
		remove: function remove() {
			this.$emit('remove', this.index);
		}
	},

	filters: {
		formatNumber: function formatNumber(num) {
			if (!num) {
				return NA;
			}

			var locale = 'EN-en';
			var precision = 2;

			num = parseFloat(num);

			return num.toLocaleString(locale, {
				minimumFractionDigits: precision,
				maximumFractionDigits: precision
			});
		}
	}
};

exports.default = definition;

},{}],3:[function(require,module,exports){
'use strict';

var _tickerOverview = require('./components/ticker-overview');

var _tickerOverview2 = _interopRequireDefault(_tickerOverview);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var instance = new Vue({
	el: '.js-instance',
	name: 'root-instance',

	components: {
		tickerOverview: _tickerOverview2.default
	}
}); /* globals Vue: false, */


window.instance = instance;

},{"./components/ticker-overview":1}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// check if websockets are supported
var isSupported = 'WebSocket' in window;

// setup websocket URL
var host = window.location.host;

var socketProtocol = window.location.protocol === 'http:' ? 'ws' : 'wss';
var socketBaseUrl = socketProtocol + '://' + host + '/ws';

var Connection = function () {
	function Connection(url) {
		_classCallCheck(this, Connection);

		this.socket = new WebSocket(url);

		this.state = {};

		this.updateState = this.updateState.bind(this);
		this.onSocketOpen = this.onSocketOpen.bind(this);
		this.onSocketError = this.onSocketError.bind(this);
		this.onSocketMessage = this.onSocketMessage.bind(this);

		this.socket.addEventListener('open', this.onSocketOpen);
		this.socket.addEventListener('error', this.onSocketError);
		this.socket.addEventListener('message', this.onSocketMessage);
		this.socket.addEventListener('close', this.onSocketClose);
	}

	/**
  * Send a message to the server.
  * @param {*} message - The message to send.
  * @return {Socket}
  */


	_createClass(Connection, [{
		key: 'send',
		value: function send(message) {
			var _this = this;

			var sendMessage = function sendMessage() {
				return _this.socket.send(JSON.stringify(message));
			};

			if (this.isConnected) {
				sendMessage();

				return this;
			}

			this.waitForSocketConnection().then(sendMessage).catch(console.warn);

			return this;
		}
	}, {
		key: 'waitForSocketConnection',
		value: function waitForSocketConnection() {
			var _this2 = this;

			if (this.isClosing || this.isClosed) {
				return Promise.reject(new Error('Socket is not open.'));
			}

			return new Promise(function (resolve) {
				var onSocketOpen = function onSocketOpen() {
					_this2.socket.removeEventListener('open', onSocketOpen);
					resolve();
				};

				_this2.socket.addEventListener('open', onSocketOpen);
			});
		}
	}, {
		key: 'updateState',
		value: function updateState() {
			this.state.isConnected = this.isConnected;
			this.state.isReconnecting = this.isReconnecting;
		}
	}, {
		key: 'onSocketOpen',
		value: function onSocketOpen() {
			this.reconnectAttempts = 0;
			this.isReconnecting = false;
			this.updateState();
		}
	}, {
		key: 'onSocketError',
		value: function onSocketError() {
			this.updateState();
		}
	}, {
		key: 'onSocketMessage',
		value: function onSocketMessage() {
			//
		}
	}, {
		key: 'isConnecting',
		get: function get() {
			return this.socket && this.socket.readyState === WebSocket.CONNECTING;
		}
	}, {
		key: 'isConnected',
		get: function get() {
			return this.socket && this.socket.readyState === WebSocket.OPEN;
		}
	}, {
		key: 'isClosing',
		get: function get() {
			return this.socket && this.socket.readyState === WebSocket.CLOSING;
		}
	}, {
		key: 'isClosed',
		get: function get() {
			return !this.socket || this.socket.readyState === WebSocket.CLOSED;
		}
	}]);

	return Connection;
}();

exports.default = new Connection(socketBaseUrl);

},{}]},{},[3])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzb3VyY2VcXGpzXFxjb21wb25lbnRzXFx0aWNrZXItb3ZlcnZpZXcuanMiLCJzb3VyY2VcXGpzXFxjb21wb25lbnRzXFx0aWNrZXIuanMiLCJzb3VyY2VcXGpzXFxtYWluLmpzIiwic291cmNlXFxqc1xcdXRpbHNcXHNvY2tldC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7OztBQ0FBOzs7O0FBQ0E7Ozs7OztBQUVBLGlCQUFpQixJQUFqQixDQUFzQixVQUF0Qjs7QUFFQSxJQUFNLGFBQWE7QUFDbEIsT0FBTSxpQkFEWTs7QUFHbEIsYUFBWTtBQUNYO0FBRFcsRUFITTs7QUFPbEIsS0FQa0Isa0JBT1g7QUFDTixTQUFPO0FBQ04sb0JBQWlCLElBRFgsRUFDaUI7QUFDdkIsbUJBQWdCLElBRlY7QUFHTixZQUFTLHVrQkFBdWtCLEtBQXZrQixDQUE2a0IsSUFBN2tCLENBSEg7QUFJTixZQUFTLENBQ1IsRUFBRSxRQUFRLE1BQVYsRUFBa0IsWUFBWSxLQUE5QixFQURRLENBSkg7O0FBUU4sV0FBUTtBQVJGLEdBQVA7QUFVQSxFQWxCaUI7OztBQW9CbEIsV0FBVTtBQUNULGVBRFMsMkJBQ087QUFDZixVQUFPLEtBQUssT0FBTCxDQUFhLEdBQWIsQ0FBaUI7QUFBQSxXQUFVLE9BQU8sTUFBakI7QUFBQSxJQUFqQixDQUFQO0FBQ0E7QUFIUSxFQXBCUTs7QUEwQmxCLFFBQU87QUFDTixTQURNLHFCQUNJO0FBQ1QsUUFBSyxTQUFMO0FBQ0E7QUFISyxFQTFCVzs7QUFnQ2xCLFFBaENrQixxQkFnQ1I7QUFDVCxtQkFBaUIsTUFBakIsQ0FBd0IsZ0JBQXhCLENBQXlDLFNBQXpDLEVBQW9ELEtBQUssZUFBekQ7QUFDQSxPQUFLLFNBQUw7QUFDQSxFQW5DaUI7OztBQXFDbEIsVUFBUztBQUNSLGNBRFEsd0JBQ0ssTUFETCxFQUNhO0FBQ3BCLFVBQU8sS0FBSyxPQUFMLENBQWEs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QjtBQUNBOzs7c0JBRWtCO0FBQ2xCLFVBQU8sS0FBSyxNQUFMLElBQWUsS0FBSyxNQUFMLENBQVksVUFBWixLQUEyQixVQUFVLFVBQTNEO0FBQ0E7OztzQkFFaUI7QUFDakIsVUFBTyxLQUFLLE1BQUwsSUFBZSxLQUFLLE1BQUwsQ0FBWSxVQUFaLEtBQTJCLFVBQVUsSUFBM0Q7QUFDQTs7O3NCQUVlO0FBQ2YsVUFBTyxLQUFLLE1BQUwsSUFBZSxLQUFLLE1BQUwsQ0FBWSxVQUFaLEtBQTJCLFVBQVUsT0FBM0Q7QUFDQTs7O3NCQUVjO0FBQ2QsVUFBTyxDQUFDLEtBQUssTUFBTixJQUFnQixLQUFLLE1BQUwsQ0FBWSxVQUFaLEtBQTJCLFVBQVUsTUFBNUQ7QUFDQTs7Ozs7O2tCQUdhLElBQUksVUFBSixDQUFlLGFBQWYsQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQgc29ja2V0Q29ubmVjdGlvbiBmcm9tICcuLi91dGlscy9zb2NrZXQnO1xyXG5pbXBvcnQgdGlja2VyIGZyb20gJy4vdGlja2VyJztcclxuXHJcbnNvY2tldENvbm5lY3Rpb24uc2VuZCgnaGVpbmVrZW4nKTtcclxuXHJcbmNvbnN0IGRlZmluaXRpb24gPSB7XHJcblx0bmFtZTogJ3RpY2tlci1vdmVydmlldycsXHJcblxyXG5cdGNvbXBvbmVudHM6IHtcclxuXHRcdHRpY2tlcixcclxuXHR9LFxyXG5cclxuXHRkYXRhKCkge1xyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0cmVmcmVzaEludGVydmFsOiAyMDAwLCAvLyBNU1xyXG5cdFx0XHRzZWxlY3RlZFN5bWJvbDogbnVsbCxcclxuXHRcdFx0c3ltYm9sczogJ0FBTCwgQUFQTCwgQURCRSwgQURJLCBBRFAsIEFEU0ssIEFLQU0sIEFMWE4sIEFNQVQsIEFNR04sIEFNWk4sIEFUVkksIEFWR08sIEJJRFUsIEJJSUIsIEJNUk4sIENBLCBDRUxHLCBDRVJOLCBDSEtQLCBDSFRSLCBDVFJQLCBDVEFTLCBDU0NPLCBDVFhTLCBDTUNTQSwgQ09TVCwgQ1NYLCBDVFNILCBESVNDQSwgRElTQ0ssIERJU0gsIERMVFIsIEVBLCBFQkFZLCBFU1JYLCBFWFBFLCBGQVNULCBGQiwgRklTViwgRk9YLCBGT1hBLCBHSUxELCBHT09HLCBIQVMsIEhTSUMsIEhPTFgsIElMTU4sIElOQ1ksIElOVEMsIElOVFUsIElTUkcsIEpELCBLTEFDLCBLSEMsIExCVFlBLCBMSUxBLCBMSUxBSywgTFJDWCwgUVZDQSwgTFZOVEEsIE1BUiwgTUNIUCwgTURMWiwgTU5TVCwgTVNGVCwgTVUsIE1YSU0sIE1ZTCwgTkNMSCwgTkZMWCwgTlZEQSwgT1JMWSwgUEFZWCwgUENBUiwgUENMTiwgUUNPTSwgUkVHTiwgUk9TVCwgU0JBQywgU1RYLCBTSFBHLCBTSVJJLCBTV0tTLCBTWU1DLCBUTVVTLCBUUklQLCBUU0NPLCBUU0xBLCBUWE4sIFVMVEEsIFZJQUIsIFZPRCwgVlJTSywgVlJUWCwgV0JBLCBXREMsIFhMTlgsIFhSQVksIFlIT08nLnNwbGl0KCcsICcpLFxyXG5cdFx0XHR0aWNrZXJzOiBbXHJcblx0XHRcdFx0eyBzeW1ib2w6ICdBQVBMJywgaXNFeHBhbmRlZDogZmFsc2UgfSxcclxuXHRcdFx0XSxcclxuXHJcblx0XHRcdHF1b3RlczogeyB9LFxyXG5cdFx0fTtcclxuXHR9LFxyXG5cclxuXHRjb21wdXRlZDoge1xyXG5cdFx0dGlja2VyU3ltYm9scygpIHtcclxuXHRcdFx0cmV0dXJuIHRoaXMudGlja2Vycy5tYXAodGlja2VyID0+IHRpY2tlci5zeW1ib2wpO1xyXG5cdFx0fSxcclxuXHR9LFxyXG5cclxuXHR3YXRjaDoge1xyXG5cdFx0dGlja2VycygpIHtcclxuXHRcdFx0dGhpcy5zdWJzY3JpYmUoKTtcclxuXHRcdH0sXHJcblx0fSxcclxuXHJcblx0bW91bnRlZCgpIHtcclxuXHRcdHNvY2tldENvbm5lY3Rpb24uc29ja2V0LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCB0aGlzLm9uU29ja2V0TWVzc2FnZSk7XHJcblx0XHR0aGlzLnN1YnNjcmliZSgpO1xyXG5cdH0sXHJcblxyXG5cdG1ldGhvZHM6IHtcclxuXHRcdHRpY2tlckV4aXN0cyhzeW1ib2wpIHtcclxuXHRcdFx0cmV0dXJuIHRoaXMudGlja2Vycy5maWx0ZXIodCA9PiB0LnN5bWJvbCA9PT0gc3ltYm9sKS5sZW5ndGggIT09IDA7XHJcblx0XHR9LFxyXG5cclxuXHRcdG9uVGlja2VyU2VsZWN0ZWQoKSB7XHJcblx0XHRcdHRoaXMuYWRkVGlja2VyKHRoaXMuc2VsZWN0ZWRTeW1ib2wpO1xyXG5cdFx0XHR0aGlzLnNlbGVjdGVkU3ltYm9sID0gbnVsbDtcclxuXHRcdH0sXHJcblxyXG5cdFx0b25Tb2NrZXRNZXNzYWdlKG1lc3NhZ2UpIHtcclxuXHRcdFx0Y29uc29sZS5sb2cobWVzc2FnZSk7XHJcblx0XHR9LFxyXG5cclxuXHRcdGFkZFRpY2tlcihzeW1ib2wsIGlzRXhwYW5kZWQgPSBmYWxzZSkge1xyXG5cdFx0XHR0aGlzLnRpY2tlcnMucHVzaCh7XHJcblx0XHRcdFx0c3ltYm9sLFxyXG5cdFx0XHRcdGlzRXhwYW5kZWQsXHJcblx0XHRcdH0pO1xyXG5cdFx0fSxcclxuXHJcblx0XHRyZW1vdmUoaW5kZXgpIHtcclxuXHRcdFx0dGhpcy50aWNrZXJzLnNwbGljZShpbmRleCwgMSk7XHJcblx0XHR9LFxyXG5cclxuXHRcdHRvZ2dsZUV4cGFuZGVkKGluZGV4KSB7XHJcblx0XHRcdHRoaXMudGlja2Vyc1tpbmRleF0uaXNFeHBhbmRlZCA9ICF0aGlzLnRpY2tlcnNbaW5kZXhdLmlzRXhwYW5kZWQ7XHJcblx0XHR9LFxyXG5cclxuXHRcdHN1YnNjcmliZSgpIHtcclxuXHRcdFx0Ly8gdGhpcy5mZXRjaFF1b3RlKCk7XHJcblx0XHR9LFxyXG5cclxuXHR9LFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5pdGlvbjtcclxuIiwiY29uc3Qgc3RhdGVzID0ge1xyXG5cdHBlbmRpbmc6ICdwZW5kaW5nJyxcclxuXHRsb2FkaW5nOiAnbG9hZGluZycsXHJcbn07XHJcblxyXG5jb25zdCBOQSA9ICctJztcclxuXHJcbmNvbnN0IFFVT1RFX0RFRkFVTFQgPSB7XHJcblx0QmlkOiBudWxsLFxyXG5cdEFzazogbnVsbCxcclxuXHRBdmVyYWdlRGFpbHlWb2x1bWU6IG51bGwsXHJcblx0Q3VycmVuY3k6IE5BLFxyXG5cdERheXNMb3c6IE5BLFxyXG5cdERheXNIaWdoOiBOQSxcclxuXHRMYXN0VHJhZGVEYXRlOiBOQSxcclxuXHRMYXN0VHJhZGVQcmljZU9ubHk6IE5BLFxyXG5cdE5hbWU6IE5BLFxyXG5cdE1hcmtldENhcGl0YWxpemF0aW9uOiBOQSxcclxuXHRFQklUREE6IE5BLFxyXG59O1xyXG5cclxuY29uc3QgZGVmaW5pdGlvbiA9IHtcclxuXHR0ZW1wbGF0ZTogJyN0ZW1wbGF0ZS10aWNrZXInLFxyXG5cdG5hbWU6ICd0aWNrZXInLFxyXG5cclxuXHRjb21wb25lbnRzOiB7XHJcblx0XHQvL1xyXG5cdH0sXHJcblxyXG5cdHByb3BzOiB7XHJcblx0XHRpbmRleDogeyBkZWZhdWx0OiAwIH0sXHJcblx0XHRzeW1ib2w6IHsgZGVmYXVsdDogbnVsbCB9LFxyXG5cdFx0aXNFeHBhbmRlZDogeyBkZWZhdWx0OiBmYWxzZSB9LFxyXG5cdFx0cGFzc2VkUXVvdGVzOiB7IGRlZmF1bHQ6IHsgfSB9LFxyXG5cdFx0cmVmcmVzaEludGVydmFsOiB7IGRlZmF1bHQ6IDEwMDAgfSwgLy8gaW4gTVNcclxuXHR9LFxyXG5cclxuXHRkYXRhKCkge1xyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0c3RhdGU6IHN0YXRlcy5wZW5kaW5nLFxyXG5cdFx0XHRxdW90ZVRpbWVvdXRJZDogbnVsbCxcclxuXHRcdFx0aXNQb3NpdGl2ZVRpY2s6IGZhbHNlLFxyXG5cdFx0XHRpc05lZ2F0aXZlVGljazogZmFsc2UsXHJcblx0XHR9O1xyXG5cdH0sXHJcblxyXG5cdGNvbXB1dGVkOiB7XHJcblx0XHRxdW90ZSgpIHtcclxuXHRcdFx0cmV0dXJuIHRoaXMucGFzc2VkUXVvdGVzW3RoaXMuc3ltYm9sXSB8fCBRVU9URV9ERUZBVUxUO1xyXG5cdFx0fSxcclxuXHJcblx0XHRiaWQoKSB7XHJcblx0XHRcdGlmICghdGhpcy5xdW90ZS5CaWQpIHtcclxuXHRcdFx0XHRyZXR1cm4gbnVsbDtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0cmV0dXJuIHBhcnNlRmxvYXQodGhpcy5xdW90ZS5CaWQpO1xyXG5cdFx0fSxcclxuXHJcblx0XHRhc2soKSB7XHJcblx0XHRcdGlmICghdGhpcy5xdW90ZS5Bc2spIHtcclxuXHRcdFx0XHRyZXR1cm4gbnVsbDtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0cmV0dXJuIHBhcnNlRmxvYXQodGhpcy5xdW90ZS5Bc2spO1xyXG5cdFx0fSxcclxuXHJcblx0XHRxdW90ZU1pZCgpIHtcclxuXHRcdFx0aWYgKCF0aGlzLmJpZCB8fCAhdGhpcy5hc2spIHtcclxuXHRcdFx0XHRyZXR1cm4gJy0nO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRyZXR1cm4gKCh0aGlzLmJpZCArIHRoaXMuYXNrKSAqIDAuNSkudG9QcmVjaXNpb24oNik7XHJcblx0XHR9LFxyXG5cclxuXHRcdHRvZ2dsZUJ1dHRvblRleHQoKSB7XHJcblx0XHRcdHJldHVybiB0aGlzLmlzRXhwYW5kZWQgPyAnY29sbGFwc2UnIDogJ2V4cGFuZCc7XHJcblx0XHR9LFxyXG5cdH0sXHJcblxyXG5cdHdhdGNoOiB7XHJcblx0XHRxdW90ZU1pZChuZXdWYWwsIG9sZFZhbCkge1xyXG5cdFx0XHRpZiAoIW9sZFZhbCkge1xyXG5cdFx0XHRcdHJldHVybjtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0dGhpcy5yZXNldFRpY2tTdGF0ZXMoKTtcclxuXHJcblx0XHRcdGlmIChuZXdWYWwgPiBvbGRWYWwpIHtcclxuXHRcdFx0XHR0aGlzLmlzUG9zaXRpdmVUaWNrID0gdHJ1ZTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHR0aGlzLmlzTmVnYXRpdmVUaWNrID0gdHJ1ZTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0c2V0VGltZW91dCh0aGlzLnJlc2V0VGlja1N0YXRlcywgNTAwKTtcclxuXHRcdH0sXHJcblx0fSxcclxuXHJcblx0YmVmb3JlRGVzdHJveSgpIHtcclxuXHRcdGNsZWFyVGltZW91dCh0aGlzLnF1b3RlVGltZW91dElkKTtcclxuXHR9LFxyXG5cclxuXHRtZXRob2RzOiB7XHJcblx0XHRyZXNldFRpY2tTdGF0ZXMoKSB7XHJcblx0XHRcdHRoaXMuaXNQb3NpdGl2ZVRpY2sgPSBmYWxzZTtcclxuXHRcdFx0dGhpcy5pc05lZ2F0aXZlVGljayA9IGZhbHNlO1xyXG5cdFx0fSxcclxuXHJcblx0XHR0b2dnbGVFeHBhbmRlZCgpIHtcclxuXHRcdFx0dGhpcy4kZW1pdCgndG9nZ2xlLWV4cGFuZGVkJywgdGhpcy5pbmRleCk7XHJcblx0XHR9LFxyXG5cclxuXHRcdHJlbW92ZSgpIHtcclxuXHRcdFx0dGhpcy4kZW1pdCgncmVtb3ZlJywgdGhpcy5pbmRleCk7XHJcblx0XHR9LFxyXG5cdH0sXHJcblxyXG5cdGZpbHRlcnM6IHtcclxuXHRcdGZvcm1hdE51bWJlcihudW0pIHtcclxuXHRcdFx0aWYgKCFudW0pIHtcclxuXHRcdFx0XHRyZXR1cm4gTkE7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGNvbnN0IGxvY2FsZSA9ICdFTi1lbic7XHJcblx0XHRcdGNvbnN0IHByZWNpc2lvbiA9IDI7XHJcblxyXG5cdFx0XHRudW0gPSBwYXJzZUZsb2F0KG51bSk7XHJcblxyXG5cdFx0XHRyZXR1cm4gbnVtLnRvTG9jYWxlU3RyaW5nKGxvY2FsZSwge1xyXG5cdFx0XHRcdG1pbmltdW1GcmFjdGlvbkRpZ2l0czogcHJlY2lzaW9uLFxyXG5cdFx0XHRcdG1heGltdW1GcmFjdGlvbkRpZ2l0czogcHJlY2lzaW9uLFxyXG5cdFx0XHR9KTtcclxuXHRcdH0sXHJcblx0fVxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5pdGlvbjtcclxuIiwiLyogZ2xvYmFscyBWdWU6IGZhbHNlLCAqL1xyXG5pbXBvcnQgdGlja2VyT3ZlcnZpZXcgZnJvbSAnLi9jb21wb25lbnRzL3RpY2tlci1vdmVydmlldyc7XHJcblxyXG5cclxuY29uc3QgaW5zdGFuY2UgPSBuZXcgVnVlKHtcclxuXHRlbDogJy5qcy1pbnN0YW5jZScsXHJcblx0bmFtZTogJ3Jvb3QtaW5zdGFuY2UnLFxyXG5cclxuXHRjb21wb25lbnRzOiB7XHJcblx0XHR0aWNrZXJPdmVydmlldyxcclxuXHR9LFxyXG59KTtcclxuXHJcbndpbmRvdy5pbnN0YW5jZSA9IGluc3RhbmNlO1xyXG4iLCIvLyBjaGVjayBpZiB3ZWJzb2NrZXRzIGFyZSBzdXBwb3J0ZWRcclxuY29uc3QgaXNTdXBwb3J0ZWQgPSAnV2ViU29ja2V0JyBpbiB3aW5kb3c7XHJcblxyXG4vLyBzZXR1cCB3ZWJzb2NrZXQgVVJMXHJcbmNvbnN0IHsgaG9zdCB9ID0gd2luZG93LmxvY2F0aW9uO1xyXG5jb25zdCBzb2NrZXRQcm90b2NvbCA9IHdpbmRvdy5sb2NhdGlvbi5wcm90b2NvbCA9PT0gJ2h0dHA6JyA/ICd3cycgOiAnd3NzJztcclxuY29uc3Qgc29ja2V0QmFzZVVybCA9IGAke3NvY2tldFByb3RvY29sfTovLyR7aG9zdH0vd3NgO1xyXG5cclxuY2xhc3MgQ29ubmVjdGlvbiB7XHJcblx0Y29uc3RydWN0b3IodXJsKSB7XHJcblx0XHR0aGlzLnNvY2tldCA9IG5ldyBXZWJTb2NrZXQodXJsKTtcclxuXHJcblx0XHR0aGlzLnN0YXRlID0ge307XHJcblxyXG5cdFx0dGhpcy51cGRhdGVTdGF0ZSA9IHRoaXMudXBkYXRlU3RhdGUuYmluZCh0aGlzKTtcclxuXHRcdHRoaXMub25Tb2NrZXRPcGVuID0gdGhpcy5vblNvY2tldE9wZW4uYmluZCh0aGlzKTtcclxuXHRcdHRoaXMub25Tb2NrZXRFcnJvciA9IHRoaXMub25Tb2NrZXRFcnJvci5iaW5kKHRoaXMpO1xyXG5cdFx0dGhpcy5vblNvY2tldE1lc3NhZ2UgPSB0aGlzLm9uU29ja2V0TWVzc2FnZS5iaW5kKHRoaXMpO1xyXG5cclxuXHRcdHRoaXMuc29ja2V0LmFkZEV2ZW50TGlzdGVuZXIoJ29wZW4nLCB0aGlzLm9uU29ja2V0T3Blbik7XHJcblx0XHR0aGlzLnNvY2tldC5hZGRFdmVudExpc3RlbmVyKCdlcnJvcicsIHRoaXMub25Tb2NrZXRFcnJvcik7XHJcblx0XHR0aGlzLnNvY2tldC5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgdGhpcy5vblNvY2tldE1lc3NhZ2UpO1xyXG5cdFx0dGhpcy5zb2NrZXQuYWRkRXZlbnRMaXN0ZW5lcignY2xvc2UnLCB0aGlzLm9uU29ja2V0Q2xvc2UpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogU2VuZCBhIG1lc3NhZ2UgdG8gdGhlIHNlcnZlci5cclxuXHQgKiBAcGFyYW0geyp9IG1lc3NhZ2UgLSBUaGUgbWVzc2FnZSB0byBzZW5kLlxyXG5cdCAqIEByZXR1cm4ge1NvY2tldH1cclxuXHQgKi9cclxuXHRzZW5kKG1lc3NhZ2UpIHtcclxuXHRcdGNvbnN0IHNlbmRNZXNzYWdlID0gKCkgPT4gdGhpcy5zb2NrZXQuc2VuZChKU09OLnN0cmluZ2lmeShtZXNzYWdlKSk7XHJcblxyXG5cdFx0aWYgKHRoaXMuaXNDb25uZWN0ZWQpIHtcclxuXHRcdFx0c2VuZE1lc3NhZ2UoKTtcclxuXHJcblx0XHRcdHJldHVybiB0aGlzO1xyXG5cdFx0fVxyXG5cclxuXHRcdHRoaXMud2FpdEZvclNvY2tldENvbm5lY3Rpb24oKVxyXG5cdFx0XHQudGhlbihzZW5kTWVzc2FnZSlcclxuXHRcdFx0LmNhdGNoKGNvbnNvbGUud2Fybik7XHJcblxyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fVxyXG5cclxuXHR3YWl0Rm9yU29ja2V0Q29ubmVjdGlvbigpIHtcclxuXHRcdGlmICh0aGlzLmlzQ2xvc2luZyB8fCB0aGlzLmlzQ2xvc2VkKSB7XHJcblx0XHRcdHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgRXJyb3IoJ1NvY2tldCBpcyBub3Qgb3Blbi4nKSk7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XHJcblx0XHRcdGNvbnN0IG9uU29ja2V0T3BlbiA9ICgpID0+IHtcclxuXHRcdFx0XHR0aGlzLnNvY2tldC5yZW1vdmVFdmVudExpc3RlbmVyKCdvcGVuJywgb25Tb2NrZXRPcGVuKTtcclxuXHRcdFx0XHRyZXNvbHZlKCk7XHJcblx0XHRcdH07XHJcblxyXG5cdFx0XHR0aGlzLnNvY2tldC5hZGRFdmVudExpc3RlbmVyKCdvcGVuJywgb25Tb2NrZXRPcGVuKTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0dXBkYXRlU3RhdGUoKSB7XHJcblx0XHR0aGlzLnN0YXRlLmlzQ29ubmVjdGVkID0gdGhpcy5pc0Nvbm5lY3RlZDtcclxuXHRcdHRoaXMuc3RhdGUuaXNSZWNvbm5lY3RpbmcgPSB0aGlzLmlzUmVjb25uZWN0aW5nO1xyXG5cdH1cclxuXHJcblx0b25Tb2NrZXRPcGVuKCkge1xyXG5cdFx0dGhpcy5yZWNvbm5lY3RBdHRlbXB0cyA9IDA7XHJcblx0XHR0aGlzLmlzUmVjb25uZWN0aW5nID0gZmFsc2U7XHJcblx0XHR0aGlzLnVwZGF0ZVN0YXRlKCk7XHJcblx0fVxyXG5cclxuXHRvblNvY2tldEVycm9yKCkge1xyXG5cdFx0dGhpcy51cGRhdGVTdGF0ZSgpO1xyXG5cdH1cclxuXHJcblx0b25Tb2NrZXRNZXNzYWdlKCkge1xyXG5cdFx0Ly9cclxuXHR9XHJcblxyXG5cdGdldCBpc0Nvbm5lY3RpbmcoKSB7XHJcblx0XHRyZXR1cm4gdGhpcy5zb2NrZXQgJiYgdGhpcy5zb2NrZXQucmVhZHlTdGF0ZSA9PT0gV2ViU29ja2V0LkNPTk5FQ1RJTkc7XHJcblx0fVxyXG5cclxuXHRnZXQgaXNDb25uZWN0ZWQoKSB7XHJcblx0XHRyZXR1cm4gdGhpcy5zb2NrZXQgJiYgdGhpcy5zb2NrZXQucmVhZHlTdGF0ZSA9PT0gV2ViU29ja2V0Lk9QRU47XHJcblx0fVxyXG5cclxuXHRnZXQgaXNDbG9zaW5nKCkge1xyXG5cdFx0cmV0dXJuIHRoaXMuc29ja2V0ICYmIHRoaXMuc29ja2V0LnJlYWR5U3RhdGUgPT09IFdlYlNvY2tldC5DTE9TSU5HO1xyXG5cdH1cclxuXHJcblx0Z2V0IGlzQ2xvc2VkKCkge1xyXG5cdFx0cmV0dXJuICF0aGlzLnNvY2tldCB8fCB0aGlzLnNvY2tldC5yZWFkeVN0YXRlID09PSBXZWJTb2NrZXQuQ0xPU0VEO1xyXG5cdH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgbmV3IENvbm5lY3Rpb24oc29ja2V0QmFzZVVybCk7Il19
