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

var definition = {
	name: 'ticker-overview',

	components: {
		ticker: _ticker2.default
	},

	data: function data() {
		return {
			selectedSymbol: null,
			symbols: ['Heineken', 'Yahoo', 'VI Company', 'Apple'],
			tickers: [{ symbol: 'Heineken' }],

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
		onSocketMessage: function onSocketMessage(message) {
			var data = JSON.parse(message.data);

			this.$set(this.quotes, data.fund, data);
		},
		subscribe: function subscribe() {
			this.tickerSymbols.forEach(function (s) {
				_socket2.default.send(s);
			});
		}
	}
};

exports.default = definition;

},{"../utils/socket":4,"./ticker":2}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
var NA = '-';

var QUOTE_DEFAULT = {
	bid: null,
	ask: null,
	fund: ''
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
		quotes: { default: {} }
	},

	data: function data() {
		return {
			quoteTimeoutId: null,
			isPositiveTick: false,
			isNegativeTick: false
		};
	},


	computed: {
		quote: function quote() {
			return this.quotes[this.symbol] || QUOTE_DEFAULT;
		},
		bid: function bid() {
			if (!this.quote.bid) {
				return null;
			}

			return parseFloat(this.quote.bid);
		},
		ask: function ask() {
			if (!this.quote.ask) {
				return null;
			}

			return parseFloat(this.quote.ask);
		},
		quoteMid: function quoteMid() {
			if (!this.bid || !this.ask) {
				return '-';
			}

			return ((this.bid + this.ask) * 0.5).toPrecision(6);
		}
	},

	watch: {
		quoteMid: function quoteMid(newVal, oldVal) {
			if (!oldVal) {
				return;
			}

			if (newVal > oldVal) {
				this.isNegativeTick = false;
				this.isPositiveTick = true;
			} else {
				this.isNegativeTick = true;
				this.isPositiveTick = false;
			}
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzb3VyY2VcXGpzXFxjb21wb25lbnRzXFx0aWNrZXItb3ZlcnZpZXcuanMiLCJzb3VyY2VcXGpzXFxjb21wb25lbnRzXFx0aWNrZXIuanMiLCJzb3VyY2VcXGpzXFxtYWluLmpzIiwic291cmNlXFxqc1xcdXRpbHNcXHNvY2tldC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7OztBQ0FBOzs7O0FBQ0E7Ozs7OztBQUVBLElBQU0sYUFBYTtBQUNsQixPQUFNLGlCQURZOztBQUdsQixhQUFZO0FBQ1g7QUFEVyxFQUhNOztBQU9sQixLQVBrQixrQkFPWDtBQUNOLFNBQU87QUFDTixtQkFBZ0IsSUFEVjtBQUVOLFlBQVMsQ0FBQyxVQUFELEVBQWEsT0FBYixFQUFzQixZQUF0QixFQUFvQyxPQUFwQyxDQUZIO0FBR04sWUFBUyxDQUNSLEVBQUUsUUFBUSxVQUFWLEVBRFEsQ0FISDs7QUFPTixXQUFRO0FBUEYsR0FBUDtBQVNBLEVBakJpQjs7O0FBbUJsQixXQUFVO0FBQ1QsZUFEUywyQkFDTztBQUNmLFVBQU8sS0FBSyxPQUFMLENBQWEsR0FBYixDQUFpQjtBQUFBLFdBQVUsT0FBTyxNQUFqQjtBQUFBLElBQWpCLENBQVA7QUFDQTtBQUhRLEVBbkJROztBQXlCbEIsUUFBTztBQUNOLFNBRE0scUJBQ0k7QUFDVCxRQUFLLFNBQUw7QUFDQTtBQUhLLEVBekJXOztBQStCbEIsUUEvQmtCLHFCQStCUjtBQUNULG1CQUFpQixNQUFqQixDQUF3QixnQkFBeEIsQ0FBeUMsU0FBekMsRUFBb0QsS0FBSyxlQUF6RDs7QUFFQSxPQUFLLFNBQUw7QUFDQSxFQW5DaUI7OztBQXFDbEIsVUFBUztBQUNSLGNBRFEsd0JBQ0ssTUFETCxFQUNhO0FBQ3BCLFVBQU8sS0FBSyxPQUFMLENBQWEsTUFBYixDQUFvQjtBQUFBLFdBQUssRUFBRSxNQUFGLEtBQWEsTUFBbEI7QUFBQSxJQUFwQixFQUE4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S0FBMkIsVUFBVSxPQUEzRDtBQUNBOzs7c0JBRWM7QUFDZCxVQUFPLENBQUMsS0FBSyxNQUFOLElBQWdCLEtBQUssTUFBTCxDQUFZLFVBQVosS0FBMkIsVUFBVSxNQUE1RDtBQUNBOzs7Ozs7a0JBR2EsSUFBSSxVQUFKLENBQWUsYUFBZixDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImltcG9ydCBzb2NrZXRDb25uZWN0aW9uIGZyb20gJy4uL3V0aWxzL3NvY2tldCc7XHJcbmltcG9ydCB0aWNrZXIgZnJvbSAnLi90aWNrZXInO1xyXG5cclxuY29uc3QgZGVmaW5pdGlvbiA9IHtcclxuXHRuYW1lOiAndGlja2VyLW92ZXJ2aWV3JyxcclxuXHJcblx0Y29tcG9uZW50czoge1xyXG5cdFx0dGlja2VyLFxyXG5cdH0sXHJcblxyXG5cdGRhdGEoKSB7XHJcblx0XHRyZXR1cm4ge1xyXG5cdFx0XHRzZWxlY3RlZFN5bWJvbDogbnVsbCxcclxuXHRcdFx0c3ltYm9sczogWydIZWluZWtlbicsICdZYWhvbycsICdWSSBDb21wYW55JywgJ0FwcGxlJ10sXHJcblx0XHRcdHRpY2tlcnM6IFtcclxuXHRcdFx0XHR7IHN5bWJvbDogJ0hlaW5la2VuJyB9LFxyXG5cdFx0XHRdLFxyXG5cclxuXHRcdFx0cXVvdGVzOiB7IH0sXHJcblx0XHR9O1xyXG5cdH0sXHJcblxyXG5cdGNvbXB1dGVkOiB7XHJcblx0XHR0aWNrZXJTeW1ib2xzKCkge1xyXG5cdFx0XHRyZXR1cm4gdGhpcy50aWNrZXJzLm1hcCh0aWNrZXIgPT4gdGlja2VyLnN5bWJvbCk7XHJcblx0XHR9LFxyXG5cdH0sXHJcblxyXG5cdHdhdGNoOiB7XHJcblx0XHR0aWNrZXJzKCkge1xyXG5cdFx0XHR0aGlzLnN1YnNjcmliZSgpO1xyXG5cdFx0fSxcclxuXHR9LFxyXG5cclxuXHRtb3VudGVkKCkge1xyXG5cdFx0c29ja2V0Q29ubmVjdGlvbi5zb2NrZXQuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIHRoaXMub25Tb2NrZXRNZXNzYWdlKTtcclxuXHJcblx0XHR0aGlzLnN1YnNjcmliZSgpO1xyXG5cdH0sXHJcblxyXG5cdG1ldGhvZHM6IHtcclxuXHRcdHRpY2tlckV4aXN0cyhzeW1ib2wpIHtcclxuXHRcdFx0cmV0dXJuIHRoaXMudGlja2Vycy5maWx0ZXIodCA9PiB0LnN5bWJvbCA9PT0gc3ltYm9sKS5sZW5ndGggIT09IDA7XHJcblx0XHR9LFxyXG5cclxuXHRcdG9uVGlja2VyU2VsZWN0ZWQoKSB7XHJcblx0XHRcdHRoaXMuYWRkVGlja2VyKHRoaXMuc2VsZWN0ZWRTeW1ib2wpO1xyXG5cdFx0XHR0aGlzLnNlbGVjdGVkU3ltYm9sID0gbnVsbDtcclxuXHRcdH0sXHJcblxyXG5cdFx0YWRkVGlja2VyKHN5bWJvbCwgaXNFeHBhbmRlZCA9IGZhbHNlKSB7XHJcblx0XHRcdHRoaXMudGlja2Vycy5wdXNoKHtcclxuXHRcdFx0XHRzeW1ib2wsXHJcblx0XHRcdFx0aXNFeHBhbmRlZCxcclxuXHRcdFx0fSk7XHJcblx0XHR9LFxyXG5cclxuXHRcdHJlbW92ZShpbmRleCkge1xyXG5cdFx0XHR0aGlzLnRpY2tlcnMuc3BsaWNlKGluZGV4LCAxKTtcclxuXHRcdH0sXHJcblxyXG5cdFx0dG9nZ2xlRXhwYW5kZWQoaW5kZXgpIHtcclxuXHRcdFx0dGhpcy50aWNrZXJzW2luZGV4XS5pc0V4cGFuZGVkID0gIXRoaXMudGlja2Vyc1tpbmRleF0uaXNFeHBhbmRlZDtcclxuXHRcdH0sXHJcblxyXG5cdFx0b25Tb2NrZXRNZXNzYWdlKG1lc3NhZ2UpIHtcclxuXHRcdFx0Y29uc3QgZGF0YSA9IEpTT04ucGFyc2UobWVzc2FnZS5kYXRhKTtcclxuXHJcblx0XHRcdHRoaXMuJHNldCh0aGlzLnF1b3RlcywgZGF0YS5mdW5kLCBkYXRhKTtcclxuXHRcdH0sXHJcblxyXG5cdFx0c3Vic2NyaWJlKCkge1xyXG5cdFx0XHR0aGlzLnRpY2tlclN5bWJvbHMuZm9yRWFjaCgocykgPT4ge1xyXG5cdFx0XHRcdHNvY2tldENvbm5lY3Rpb24uc2VuZChzKTtcclxuXHRcdFx0fSk7XHJcblx0XHR9LFxyXG5cclxuXHR9LFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5pdGlvbjtcclxuIiwiY29uc3QgTkEgPSAnLSc7XHJcblxyXG5jb25zdCBRVU9URV9ERUZBVUxUID0ge1xyXG5cdGJpZDogbnVsbCxcclxuXHRhc2s6IG51bGwsXHJcblx0ZnVuZDogJycsXHJcbn07XHJcblxyXG5jb25zdCBkZWZpbml0aW9uID0ge1xyXG5cdHRlbXBsYXRlOiAnI3RlbXBsYXRlLXRpY2tlcicsXHJcblx0bmFtZTogJ3RpY2tlcicsXHJcblxyXG5cdGNvbXBvbmVudHM6IHtcclxuXHRcdC8vXHJcblx0fSxcclxuXHJcblx0cHJvcHM6IHtcclxuXHRcdGluZGV4OiB7IGRlZmF1bHQ6IDAgfSxcclxuXHRcdHN5bWJvbDogeyBkZWZhdWx0OiBudWxsIH0sXHJcblx0XHRpc0V4cGFuZGVkOiB7IGRlZmF1bHQ6IGZhbHNlIH0sXHJcblx0XHRxdW90ZXM6IHsgZGVmYXVsdDogeyB9IH0sXHJcblx0fSxcclxuXHJcblx0ZGF0YSgpIHtcclxuXHRcdHJldHVybiB7XHJcblx0XHRcdHF1b3RlVGltZW91dElkOiBudWxsLFxyXG5cdFx0XHRpc1Bvc2l0aXZlVGljazogZmFsc2UsXHJcblx0XHRcdGlzTmVnYXRpdmVUaWNrOiBmYWxzZSxcclxuXHRcdH07XHJcblx0fSxcclxuXHJcblx0Y29tcHV0ZWQ6IHtcclxuXHRcdHF1b3RlKCkge1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5xdW90ZXNbdGhpcy5zeW1ib2xdIHx8IFFVT1RFX0RFRkFVTFQ7XHJcblx0XHR9LFxyXG5cclxuXHRcdGJpZCgpIHtcclxuXHRcdFx0aWYgKCF0aGlzLnF1b3RlLmJpZCkge1xyXG5cdFx0XHRcdHJldHVybiBudWxsO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRyZXR1cm4gcGFyc2VGbG9hdCh0aGlzLnF1b3RlLmJpZCk7XHJcblx0XHR9LFxyXG5cclxuXHRcdGFzaygpIHtcclxuXHRcdFx0aWYgKCF0aGlzLnF1b3RlLmFzaykge1xyXG5cdFx0XHRcdHJldHVybiBudWxsO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRyZXR1cm4gcGFyc2VGbG9hdCh0aGlzLnF1b3RlLmFzayk7XHJcblx0XHR9LFxyXG5cclxuXHRcdHF1b3RlTWlkKCkge1xyXG5cdFx0XHRpZiAoIXRoaXMuYmlkIHx8ICF0aGlzLmFzaykge1xyXG5cdFx0XHRcdHJldHVybiAnLSc7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHJldHVybiAoKHRoaXMuYmlkICsgdGhpcy5hc2spICogMC41KS50b1ByZWNpc2lvbig2KTtcclxuXHRcdH0sXHJcblx0fSxcclxuXHJcblx0d2F0Y2g6IHtcclxuXHRcdHF1b3RlTWlkKG5ld1ZhbCwgb2xkVmFsKSB7XHJcblx0XHRcdGlmICghb2xkVmFsKSB7XHJcblx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRpZiAobmV3VmFsID4gb2xkVmFsKSB7XHJcblx0XHRcdFx0dGhpcy5pc05lZ2F0aXZlVGljayA9IGZhbHNlO1xyXG5cdFx0XHRcdHRoaXMuaXNQb3NpdGl2ZVRpY2sgPSB0cnVlO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdHRoaXMuaXNOZWdhdGl2ZVRpY2sgPSB0cnVlO1xyXG5cdFx0XHRcdHRoaXMuaXNQb3NpdGl2ZVRpY2sgPSBmYWxzZTtcclxuXHRcdFx0fVxyXG5cdFx0fSxcclxuXHR9LFxyXG5cclxuXHRiZWZvcmVEZXN0cm95KCkge1xyXG5cdFx0Y2xlYXJUaW1lb3V0KHRoaXMucXVvdGVUaW1lb3V0SWQpO1xyXG5cdH0sXHJcblxyXG5cdG1ldGhvZHM6IHtcclxuXHRcdHJlc2V0VGlja1N0YXRlcygpIHtcclxuXHRcdFx0dGhpcy5pc1Bvc2l0aXZlVGljayA9IGZhbHNlO1xyXG5cdFx0XHR0aGlzLmlzTmVnYXRpdmVUaWNrID0gZmFsc2U7XHJcblx0XHR9LFxyXG5cclxuXHRcdHRvZ2dsZUV4cGFuZGVkKCkge1xyXG5cdFx0XHR0aGlzLiRlbWl0KCd0b2dnbGUtZXhwYW5kZWQnLCB0aGlzLmluZGV4KTtcclxuXHRcdH0sXHJcblxyXG5cdFx0cmVtb3ZlKCkge1xyXG5cdFx0XHR0aGlzLiRlbWl0KCdyZW1vdmUnLCB0aGlzLmluZGV4KTtcclxuXHRcdH0sXHJcblx0fSxcclxuXHJcblx0ZmlsdGVyczoge1xyXG5cdFx0Zm9ybWF0TnVtYmVyKG51bSkge1xyXG5cdFx0XHRpZiAoIW51bSkge1xyXG5cdFx0XHRcdHJldHVybiBOQTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0Y29uc3QgbG9jYWxlID0gJ0VOLWVuJztcclxuXHRcdFx0Y29uc3QgcHJlY2lzaW9uID0gMjtcclxuXHJcblx0XHRcdG51bSA9IHBhcnNlRmxvYXQobnVtKTtcclxuXHJcblx0XHRcdHJldHVybiBudW0udG9Mb2NhbGVTdHJpbmcobG9jYWxlLCB7XHJcblx0XHRcdFx0bWluaW11bUZyYWN0aW9uRGlnaXRzOiBwcmVjaXNpb24sXHJcblx0XHRcdFx0bWF4aW11bUZyYWN0aW9uRGlnaXRzOiBwcmVjaXNpb24sXHJcblx0XHRcdH0pO1xyXG5cdFx0fSxcclxuXHR9LFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5pdGlvbjtcclxuIiwiLyogZ2xvYmFscyBWdWU6IGZhbHNlLCAqL1xyXG5pbXBvcnQgdGlja2VyT3ZlcnZpZXcgZnJvbSAnLi9jb21wb25lbnRzL3RpY2tlci1vdmVydmlldyc7XHJcblxyXG5cclxuY29uc3QgaW5zdGFuY2UgPSBuZXcgVnVlKHtcclxuXHRlbDogJy5qcy1pbnN0YW5jZScsXHJcblx0bmFtZTogJ3Jvb3QtaW5zdGFuY2UnLFxyXG5cclxuXHRjb21wb25lbnRzOiB7XHJcblx0XHR0aWNrZXJPdmVydmlldyxcclxuXHR9LFxyXG59KTtcclxuXHJcbndpbmRvdy5pbnN0YW5jZSA9IGluc3RhbmNlO1xyXG4iLCIvLyBjaGVjayBpZiB3ZWJzb2NrZXRzIGFyZSBzdXBwb3J0ZWRcclxuY29uc3QgaXNTdXBwb3J0ZWQgPSAnV2ViU29ja2V0JyBpbiB3aW5kb3c7XHJcblxyXG4vLyBzZXR1cCB3ZWJzb2NrZXQgVVJMXHJcbmNvbnN0IHsgaG9zdCB9ID0gd2luZG93LmxvY2F0aW9uO1xyXG5jb25zdCBzb2NrZXRQcm90b2NvbCA9IHdpbmRvdy5sb2NhdGlvbi5wcm90b2NvbCA9PT0gJ2h0dHA6JyA/ICd3cycgOiAnd3NzJztcclxuY29uc3Qgc29ja2V0QmFzZVVybCA9IGAke3NvY2tldFByb3RvY29sfTovLyR7aG9zdH0vd3NgO1xyXG5cclxuY2xhc3MgQ29ubmVjdGlvbiB7XHJcblx0Y29uc3RydWN0b3IodXJsKSB7XHJcblx0XHR0aGlzLnNvY2tldCA9IG5ldyBXZWJTb2NrZXQodXJsKTtcclxuXHJcblx0XHR0aGlzLnN0YXRlID0ge307XHJcblxyXG5cdFx0dGhpcy51cGRhdGVTdGF0ZSA9IHRoaXMudXBkYXRlU3RhdGUuYmluZCh0aGlzKTtcclxuXHRcdHRoaXMub25Tb2NrZXRPcGVuID0gdGhpcy5vblNvY2tldE9wZW4uYmluZCh0aGlzKTtcclxuXHRcdHRoaXMub25Tb2NrZXRFcnJvciA9IHRoaXMub25Tb2NrZXRFcnJvci5iaW5kKHRoaXMpO1xyXG5cdFx0dGhpcy5vblNvY2tldE1lc3NhZ2UgPSB0aGlzLm9uU29ja2V0TWVzc2FnZS5iaW5kKHRoaXMpO1xyXG5cclxuXHRcdHRoaXMuc29ja2V0LmFkZEV2ZW50TGlzdGVuZXIoJ29wZW4nLCB0aGlzLm9uU29ja2V0T3Blbik7XHJcblx0XHR0aGlzLnNvY2tldC5hZGRFdmVudExpc3RlbmVyKCdlcnJvcicsIHRoaXMub25Tb2NrZXRFcnJvcik7XHJcblx0XHR0aGlzLnNvY2tldC5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgdGhpcy5vblNvY2tldE1lc3NhZ2UpO1xyXG5cdFx0dGhpcy5zb2NrZXQuYWRkRXZlbnRMaXN0ZW5lcignY2xvc2UnLCB0aGlzLm9uU29ja2V0Q2xvc2UpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogU2VuZCBhIG1lc3NhZ2UgdG8gdGhlIHNlcnZlci5cclxuXHQgKiBAcGFyYW0geyp9IG1lc3NhZ2UgLSBUaGUgbWVzc2FnZSB0byBzZW5kLlxyXG5cdCAqIEByZXR1cm4ge1NvY2tldH1cclxuXHQgKi9cclxuXHRzZW5kKG1lc3NhZ2UpIHtcclxuXHRcdGNvbnN0IHNlbmRNZXNzYWdlID0gKCkgPT4gdGhpcy5zb2NrZXQuc2VuZChKU09OLnN0cmluZ2lmeShtZXNzYWdlKSk7XHJcblxyXG5cdFx0aWYgKHRoaXMuaXNDb25uZWN0ZWQpIHtcclxuXHRcdFx0c2VuZE1lc3NhZ2UoKTtcclxuXHJcblx0XHRcdHJldHVybiB0aGlzO1xyXG5cdFx0fVxyXG5cclxuXHRcdHRoaXMud2FpdEZvclNvY2tldENvbm5lY3Rpb24oKVxyXG5cdFx0XHQudGhlbihzZW5kTWVzc2FnZSlcclxuXHRcdFx0LmNhdGNoKGNvbnNvbGUud2Fybik7XHJcblxyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fVxyXG5cclxuXHR3YWl0Rm9yU29ja2V0Q29ubmVjdGlvbigpIHtcclxuXHRcdGlmICh0aGlzLmlzQ2xvc2luZyB8fCB0aGlzLmlzQ2xvc2VkKSB7XHJcblx0XHRcdHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgRXJyb3IoJ1NvY2tldCBpcyBub3Qgb3Blbi4nKSk7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XHJcblx0XHRcdGNvbnN0IG9uU29ja2V0T3BlbiA9ICgpID0+IHtcclxuXHRcdFx0XHR0aGlzLnNvY2tldC5yZW1vdmVFdmVudExpc3RlbmVyKCdvcGVuJywgb25Tb2NrZXRPcGVuKTtcclxuXHRcdFx0XHRyZXNvbHZlKCk7XHJcblx0XHRcdH07XHJcblxyXG5cdFx0XHR0aGlzLnNvY2tldC5hZGRFdmVudExpc3RlbmVyKCdvcGVuJywgb25Tb2NrZXRPcGVuKTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0dXBkYXRlU3RhdGUoKSB7XHJcblx0XHR0aGlzLnN0YXRlLmlzQ29ubmVjdGVkID0gdGhpcy5pc0Nvbm5lY3RlZDtcclxuXHRcdHRoaXMuc3RhdGUuaXNSZWNvbm5lY3RpbmcgPSB0aGlzLmlzUmVjb25uZWN0aW5nO1xyXG5cdH1cclxuXHJcblx0b25Tb2NrZXRPcGVuKCkge1xyXG5cdFx0dGhpcy5yZWNvbm5lY3RBdHRlbXB0cyA9IDA7XHJcblx0XHR0aGlzLmlzUmVjb25uZWN0aW5nID0gZmFsc2U7XHJcblx0XHR0aGlzLnVwZGF0ZVN0YXRlKCk7XHJcblx0fVxyXG5cclxuXHRvblNvY2tldEVycm9yKCkge1xyXG5cdFx0dGhpcy51cGRhdGVTdGF0ZSgpO1xyXG5cdH1cclxuXHJcblx0b25Tb2NrZXRNZXNzYWdlKCkge1xyXG5cdFx0Ly9cclxuXHR9XHJcblxyXG5cdGdldCBpc0Nvbm5lY3RpbmcoKSB7XHJcblx0XHRyZXR1cm4gdGhpcy5zb2NrZXQgJiYgdGhpcy5zb2NrZXQucmVhZHlTdGF0ZSA9PT0gV2ViU29ja2V0LkNPTk5FQ1RJTkc7XHJcblx0fVxyXG5cclxuXHRnZXQgaXNDb25uZWN0ZWQoKSB7XHJcblx0XHRyZXR1cm4gdGhpcy5zb2NrZXQgJiYgdGhpcy5zb2NrZXQucmVhZHlTdGF0ZSA9PT0gV2ViU29ja2V0Lk9QRU47XHJcblx0fVxyXG5cclxuXHRnZXQgaXNDbG9zaW5nKCkge1xyXG5cdFx0cmV0dXJuIHRoaXMuc29ja2V0ICYmIHRoaXMuc29ja2V0LnJlYWR5U3RhdGUgPT09IFdlYlNvY2tldC5DTE9TSU5HO1xyXG5cdH1cclxuXHJcblx0Z2V0IGlzQ2xvc2VkKCkge1xyXG5cdFx0cmV0dXJuICF0aGlzLnNvY2tldCB8fCB0aGlzLnNvY2tldC5yZWFkeVN0YXRlID09PSBXZWJTb2NrZXQuQ0xPU0VEO1xyXG5cdH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgbmV3IENvbm5lY3Rpb24oc29ja2V0QmFzZVVybCk7Il19
