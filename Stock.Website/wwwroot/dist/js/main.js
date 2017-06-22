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
			tickers: [],

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
		index: {
			default: function _default() {
				return 0;
			}
		},

		symbol: {
			default: function _default() {
				return null;
			}
		},

		quote: {
			default: function _default() {
				return [];
			}
		}
	},

	data: function data() {
		return {
			isPositiveTick: false,
			isNegativeTick: false
		};
	},


	computed: {
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
		mid: function mid() {
			if (!this.bid || !this.ask) {
				return '-';
			}

			return ((this.bid + this.ask) * 0.5).toPrecision(6);
		}
	},

	watch: {
		mid: function mid(newVal, oldVal) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzb3VyY2VcXGpzXFxjb21wb25lbnRzXFx0aWNrZXItb3ZlcnZpZXcuanMiLCJzb3VyY2VcXGpzXFxjb21wb25lbnRzXFx0aWNrZXIuanMiLCJzb3VyY2VcXGpzXFxtYWluLmpzIiwic291cmNlXFxqc1xcdXRpbHNcXHNvY2tldC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7OztBQ0FBOzs7O0FBQ0E7Ozs7OztBQUVBLElBQU0sYUFBYTtBQUNsQixPQUFNLGlCQURZOztBQUdsQixhQUFZO0FBQ1g7QUFEVyxFQUhNOztBQU9sQixLQVBrQixrQkFPWDtBQUNOLFNBQU87QUFDTixtQkFBZ0IsSUFEVjtBQUVOLFlBQVMsQ0FBQyxVQUFELEVBQWEsT0FBYixFQUFzQixZQUF0QixFQUFvQyxPQUFwQyxDQUZIO0FBR04sWUFBUyxFQUhIOztBQUtOLFdBQVE7QUFMRixHQUFQO0FBT0EsRUFmaUI7OztBQWlCbEIsV0FBVTtBQUNULGVBRFMsMkJBQ087QUFDZixVQUFPLEtBQUssT0FBTCxDQUFhLEdBQWIsQ0FBaUI7QUFBQSxXQUFVLE9BQU8sTUFBakI7QUFBQSxJQUFqQixDQUFQO0FBQ0E7QUFIUSxFQWpCUTs7QUF1QmxCLFFBQU87QUFDTixTQURNLHFCQUNJO0FBQ1QsUUFBSyxTQUFMO0FBQ0E7QUFISyxFQXZCVzs7QUE2QmxCLFFBN0JrQixxQkE2QlI7QUFDVCxtQkFBaUIsTUFBakIsQ0FBd0IsZ0JBQXhCLENBQXlDLFNBQXpDLEVBQW9ELEtBQUssZUFBekQ7O0FBRUEsT0FBSyxTQUFMO0FBQ0EsRUFqQ2lCOzs7QUFtQ2xCLFVBQVM7QUFDUixjQURRLHdCQUNLLE1BREwsRUFDYTtBQUNwQixVQUFPLEtBQUssT0FBTCxDQUFhLE1BQWIsQ0FBb0I7QUFBQSxXQUFLLEVBQUUsTUFBRixLQUFhLE1BQWxCO0FBQUEsSUFBcEIsRUFBOEMsTUFBOUMsS0FBeUQsQ0FBaEU7QUFDQSxH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cyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImltcG9ydCBzb2NrZXRDb25uZWN0aW9uIGZyb20gJy4uL3V0aWxzL3NvY2tldCc7XHJcbmltcG9ydCB0aWNrZXIgZnJvbSAnLi90aWNrZXInO1xyXG5cclxuY29uc3QgZGVmaW5pdGlvbiA9IHtcclxuXHRuYW1lOiAndGlja2VyLW92ZXJ2aWV3JyxcclxuXHJcblx0Y29tcG9uZW50czoge1xyXG5cdFx0dGlja2VyLFxyXG5cdH0sXHJcblxyXG5cdGRhdGEoKSB7XHJcblx0XHRyZXR1cm4ge1xyXG5cdFx0XHRzZWxlY3RlZFN5bWJvbDogbnVsbCxcclxuXHRcdFx0c3ltYm9sczogWydIZWluZWtlbicsICdZYWhvbycsICdWSSBDb21wYW55JywgJ0FwcGxlJ10sXHJcblx0XHRcdHRpY2tlcnM6IFtdLFxyXG5cclxuXHRcdFx0cXVvdGVzOiB7IH0sXHJcblx0XHR9O1xyXG5cdH0sXHJcblxyXG5cdGNvbXB1dGVkOiB7XHJcblx0XHR0aWNrZXJTeW1ib2xzKCkge1xyXG5cdFx0XHRyZXR1cm4gdGhpcy50aWNrZXJzLm1hcCh0aWNrZXIgPT4gdGlja2VyLnN5bWJvbCk7XHJcblx0XHR9LFxyXG5cdH0sXHJcblxyXG5cdHdhdGNoOiB7XHJcblx0XHR0aWNrZXJzKCkge1xyXG5cdFx0XHR0aGlzLnN1YnNjcmliZSgpO1xyXG5cdFx0fSxcclxuXHR9LFxyXG5cclxuXHRtb3VudGVkKCkge1xyXG5cdFx0c29ja2V0Q29ubmVjdGlvbi5zb2NrZXQuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIHRoaXMub25Tb2NrZXRNZXNzYWdlKTtcclxuXHJcblx0XHR0aGlzLnN1YnNjcmliZSgpO1xyXG5cdH0sXHJcblxyXG5cdG1ldGhvZHM6IHtcclxuXHRcdHRpY2tlckV4aXN0cyhzeW1ib2wpIHtcclxuXHRcdFx0cmV0dXJuIHRoaXMudGlja2Vycy5maWx0ZXIodCA9PiB0LnN5bWJvbCA9PT0gc3ltYm9sKS5sZW5ndGggIT09IDA7XHJcblx0XHR9LFxyXG5cclxuXHRcdG9uVGlja2VyU2VsZWN0ZWQoKSB7XHJcblx0XHRcdHRoaXMuYWRkVGlja2VyKHRoaXMuc2VsZWN0ZWRTeW1ib2wpO1xyXG5cdFx0XHR0aGlzLnNlbGVjdGVkU3ltYm9sID0gbnVsbDtcclxuXHRcdH0sXHJcblxyXG5cdFx0YWRkVGlja2VyKHN5bWJvbCwgaXNFeHBhbmRlZCA9IGZhbHNlKSB7XHJcblx0XHRcdHRoaXMudGlja2Vycy5wdXNoKHtcclxuXHRcdFx0XHRzeW1ib2wsXHJcblx0XHRcdFx0aXNFeHBhbmRlZCxcclxuXHRcdFx0fSk7XHJcblx0XHR9LFxyXG5cclxuXHRcdHJlbW92ZShpbmRleCkge1xyXG5cdFx0XHR0aGlzLnRpY2tlcnMuc3BsaWNlKGluZGV4LCAxKTtcclxuXHRcdH0sXHJcblxyXG5cdFx0dG9nZ2xlRXhwYW5kZWQoaW5kZXgpIHtcclxuXHRcdFx0dGhpcy50aWNrZXJzW2luZGV4XS5pc0V4cGFuZGVkID0gIXRoaXMudGlja2Vyc1tpbmRleF0uaXNFeHBhbmRlZDtcclxuXHRcdH0sXHJcblxyXG5cdFx0b25Tb2NrZXRNZXNzYWdlKG1lc3NhZ2UpIHtcclxuXHRcdFx0Y29uc3QgZGF0YSA9IEpTT04ucGFyc2UobWVzc2FnZS5kYXRhKTtcclxuXHJcblx0XHRcdHRoaXMuJHNldCh0aGlzLnF1b3RlcywgZGF0YS5mdW5kLCBkYXRhKTtcclxuXHRcdH0sXHJcblxyXG5cdFx0c3Vic2NyaWJlKCkge1xyXG5cdFx0XHR0aGlzLnRpY2tlclN5bWJvbHMuZm9yRWFjaCgocykgPT4ge1xyXG5cdFx0XHRcdHNvY2tldENvbm5lY3Rpb24uc2VuZChzKTtcclxuXHRcdFx0fSk7XHJcblx0XHR9LFxyXG5cclxuXHR9LFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5pdGlvbjtcclxuIiwiY29uc3QgTkEgPSAnLSc7XHJcblxyXG5jb25zdCBRVU9URV9ERUZBVUxUID0ge1xyXG5cdGJpZDogbnVsbCxcclxuXHRhc2s6IG51bGwsXHJcblx0ZnVuZDogJycsXHJcbn07XHJcblxyXG5jb25zdCBkZWZpbml0aW9uID0ge1xyXG5cdHRlbXBsYXRlOiAnI3RlbXBsYXRlLXRpY2tlcicsXHJcblx0bmFtZTogJ3RpY2tlcicsXHJcblxyXG5cdGNvbXBvbmVudHM6IHtcclxuXHRcdC8vXHJcblx0fSxcclxuXHJcblx0cHJvcHM6IHtcclxuXHRcdGluZGV4OiB7XHJcblx0XHRcdGRlZmF1bHQ6ICgpID0+MCxcclxuXHRcdH0sXHJcblxyXG5cdFx0c3ltYm9sOiB7XHJcblx0XHRcdGRlZmF1bHQ6ICgpID0+IG51bGwsXHJcblx0XHR9LFxyXG5cclxuXHRcdHF1b3RlOiB7XHJcblx0XHRcdGRlZmF1bHQ6ICgpID0+IFtdLFxyXG5cdFx0fSxcclxuXHR9LFxyXG5cclxuXHRkYXRhKCkge1xyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0aXNQb3NpdGl2ZVRpY2s6IGZhbHNlLFxyXG5cdFx0XHRpc05lZ2F0aXZlVGljazogZmFsc2UsXHJcblx0XHR9O1xyXG5cdH0sXHJcblxyXG5cdGNvbXB1dGVkOiB7XHJcblx0XHRiaWQoKSB7XHJcblx0XHRcdGlmICghdGhpcy5xdW90ZS5iaWQpIHtcclxuXHRcdFx0XHRyZXR1cm4gbnVsbDtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0cmV0dXJuIHBhcnNlRmxvYXQodGhpcy5xdW90ZS5iaWQpO1xyXG5cdFx0fSxcclxuXHJcblx0XHRhc2soKSB7XHJcblx0XHRcdGlmICghdGhpcy5xdW90ZS5hc2spIHtcclxuXHRcdFx0XHRyZXR1cm4gbnVsbDtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0cmV0dXJuIHBhcnNlRmxvYXQodGhpcy5xdW90ZS5hc2spO1xyXG5cdFx0fSxcclxuXHJcblx0XHRtaWQoKSB7XHJcblx0XHRcdGlmICghdGhpcy5iaWQgfHwgIXRoaXMuYXNrKSB7XHJcblx0XHRcdFx0cmV0dXJuICctJztcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0cmV0dXJuICgodGhpcy5iaWQgKyB0aGlzLmFzaykgKiAwLjUpLnRvUHJlY2lzaW9uKDYpO1xyXG5cdFx0fSxcclxuXHR9LFxyXG5cclxuXHR3YXRjaDoge1xyXG5cdFx0bWlkKG5ld1ZhbCwgb2xkVmFsKSB7XHJcblx0XHRcdGlmICghb2xkVmFsKSB7XHJcblx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRpZiAobmV3VmFsID4gb2xkVmFsKSB7XHJcblx0XHRcdFx0dGhpcy5pc05lZ2F0aXZlVGljayA9IGZhbHNlO1xyXG5cdFx0XHRcdHRoaXMuaXNQb3NpdGl2ZVRpY2sgPSB0cnVlO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdHRoaXMuaXNOZWdhdGl2ZVRpY2sgPSB0cnVlO1xyXG5cdFx0XHRcdHRoaXMuaXNQb3NpdGl2ZVRpY2sgPSBmYWxzZTtcclxuXHRcdFx0fVxyXG5cdFx0fSxcclxuXHR9LFxyXG5cclxuXHRiZWZvcmVEZXN0cm95KCkge1xyXG5cdFx0Y2xlYXJUaW1lb3V0KHRoaXMucXVvdGVUaW1lb3V0SWQpO1xyXG5cdH0sXHJcblxyXG5cdG1ldGhvZHM6IHtcclxuXHRcdHJlc2V0VGlja1N0YXRlcygpIHtcclxuXHRcdFx0dGhpcy5pc1Bvc2l0aXZlVGljayA9IGZhbHNlO1xyXG5cdFx0XHR0aGlzLmlzTmVnYXRpdmVUaWNrID0gZmFsc2U7XHJcblx0XHR9LFxyXG5cclxuXHRcdHJlbW92ZSgpIHtcclxuXHRcdFx0dGhpcy4kZW1pdCgncmVtb3ZlJywgdGhpcy5pbmRleCk7XHJcblx0XHR9LFxyXG5cdH0sXHJcblxyXG5cdGZpbHRlcnM6IHtcclxuXHRcdGZvcm1hdE51bWJlcihudW0pIHtcclxuXHRcdFx0aWYgKCFudW0pIHtcclxuXHRcdFx0XHRyZXR1cm4gTkE7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGNvbnN0IGxvY2FsZSA9ICdFTi1lbic7XHJcblx0XHRcdGNvbnN0IHByZWNpc2lvbiA9IDI7XHJcblxyXG5cdFx0XHRudW0gPSBwYXJzZUZsb2F0KG51bSk7XHJcblxyXG5cdFx0XHRyZXR1cm4gbnVtLnRvTG9jYWxlU3RyaW5nKGxvY2FsZSwge1xyXG5cdFx0XHRcdG1pbmltdW1GcmFjdGlvbkRpZ2l0czogcHJlY2lzaW9uLFxyXG5cdFx0XHRcdG1heGltdW1GcmFjdGlvbkRpZ2l0czogcHJlY2lzaW9uLFxyXG5cdFx0XHR9KTtcclxuXHRcdH0sXHJcblx0fSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluaXRpb247XHJcbiIsIi8qIGdsb2JhbHMgVnVlOiBmYWxzZSwgKi9cclxuaW1wb3J0IHRpY2tlck92ZXJ2aWV3IGZyb20gJy4vY29tcG9uZW50cy90aWNrZXItb3ZlcnZpZXcnO1xyXG5cclxuXHJcbmNvbnN0IGluc3RhbmNlID0gbmV3IFZ1ZSh7XHJcblx0ZWw6ICcuanMtaW5zdGFuY2UnLFxyXG5cdG5hbWU6ICdyb290LWluc3RhbmNlJyxcclxuXHJcblx0Y29tcG9uZW50czoge1xyXG5cdFx0dGlja2VyT3ZlcnZpZXcsXHJcblx0fSxcclxufSk7XHJcblxyXG53aW5kb3cuaW5zdGFuY2UgPSBpbnN0YW5jZTtcclxuIiwiLy8gY2hlY2sgaWYgd2Vic29ja2V0cyBhcmUgc3VwcG9ydGVkXHJcbmNvbnN0IGlzU3VwcG9ydGVkID0gJ1dlYlNvY2tldCcgaW4gd2luZG93O1xyXG5cclxuLy8gc2V0dXAgd2Vic29ja2V0IFVSTFxyXG5jb25zdCB7IGhvc3QgfSA9IHdpbmRvdy5sb2NhdGlvbjtcclxuY29uc3Qgc29ja2V0UHJvdG9jb2wgPSB3aW5kb3cubG9jYXRpb24ucHJvdG9jb2wgPT09ICdodHRwOicgPyAnd3MnIDogJ3dzcyc7XHJcbmNvbnN0IHNvY2tldEJhc2VVcmwgPSBgJHtzb2NrZXRQcm90b2NvbH06Ly8ke2hvc3R9L3dzYDtcclxuXHJcbmNsYXNzIENvbm5lY3Rpb24ge1xyXG5cdGNvbnN0cnVjdG9yKHVybCkge1xyXG5cdFx0dGhpcy5zb2NrZXQgPSBuZXcgV2ViU29ja2V0KHVybCk7XHJcblxyXG5cdFx0dGhpcy5zdGF0ZSA9IHt9O1xyXG5cclxuXHRcdHRoaXMudXBkYXRlU3RhdGUgPSB0aGlzLnVwZGF0ZVN0YXRlLmJpbmQodGhpcyk7XHJcblx0XHR0aGlzLm9uU29ja2V0T3BlbiA9IHRoaXMub25Tb2NrZXRPcGVuLmJpbmQodGhpcyk7XHJcblx0XHR0aGlzLm9uU29ja2V0RXJyb3IgPSB0aGlzLm9uU29ja2V0RXJyb3IuYmluZCh0aGlzKTtcclxuXHRcdHRoaXMub25Tb2NrZXRNZXNzYWdlID0gdGhpcy5vblNvY2tldE1lc3NhZ2UuYmluZCh0aGlzKTtcclxuXHJcblx0XHR0aGlzLnNvY2tldC5hZGRFdmVudExpc3RlbmVyKCdvcGVuJywgdGhpcy5vblNvY2tldE9wZW4pO1xyXG5cdFx0dGhpcy5zb2NrZXQuYWRkRXZlbnRMaXN0ZW5lcignZXJyb3InLCB0aGlzLm9uU29ja2V0RXJyb3IpO1xyXG5cdFx0dGhpcy5zb2NrZXQuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIHRoaXMub25Tb2NrZXRNZXNzYWdlKTtcclxuXHRcdHRoaXMuc29ja2V0LmFkZEV2ZW50TGlzdGVuZXIoJ2Nsb3NlJywgdGhpcy5vblNvY2tldENsb3NlKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFNlbmQgYSBtZXNzYWdlIHRvIHRoZSBzZXJ2ZXIuXHJcblx0ICogQHBhcmFtIHsqfSBtZXNzYWdlIC0gVGhlIG1lc3NhZ2UgdG8gc2VuZC5cclxuXHQgKiBAcmV0dXJuIHtTb2NrZXR9XHJcblx0ICovXHJcblx0c2VuZChtZXNzYWdlKSB7XHJcblx0XHRjb25zdCBzZW5kTWVzc2FnZSA9ICgpID0+IHRoaXMuc29ja2V0LnNlbmQoSlNPTi5zdHJpbmdpZnkobWVzc2FnZSkpO1xyXG5cclxuXHRcdGlmICh0aGlzLmlzQ29ubmVjdGVkKSB7XHJcblx0XHRcdHNlbmRNZXNzYWdlKCk7XHJcblxyXG5cdFx0XHRyZXR1cm4gdGhpcztcclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLndhaXRGb3JTb2NrZXRDb25uZWN0aW9uKClcclxuXHRcdFx0LnRoZW4oc2VuZE1lc3NhZ2UpXHJcblx0XHRcdC5jYXRjaChjb25zb2xlLndhcm4pO1xyXG5cclxuXHRcdHJldHVybiB0aGlzO1xyXG5cdH1cclxuXHJcblx0d2FpdEZvclNvY2tldENvbm5lY3Rpb24oKSB7XHJcblx0XHRpZiAodGhpcy5pc0Nsb3NpbmcgfHwgdGhpcy5pc0Nsb3NlZCkge1xyXG5cdFx0XHRyZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IEVycm9yKCdTb2NrZXQgaXMgbm90IG9wZW4uJykpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xyXG5cdFx0XHRjb25zdCBvblNvY2tldE9wZW4gPSAoKSA9PiB7XHJcblx0XHRcdFx0dGhpcy5zb2NrZXQucmVtb3ZlRXZlbnRMaXN0ZW5lcignb3BlbicsIG9uU29ja2V0T3Blbik7XHJcblx0XHRcdFx0cmVzb2x2ZSgpO1xyXG5cdFx0XHR9O1xyXG5cclxuXHRcdFx0dGhpcy5zb2NrZXQuYWRkRXZlbnRMaXN0ZW5lcignb3BlbicsIG9uU29ja2V0T3Blbik7XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdHVwZGF0ZVN0YXRlKCkge1xyXG5cdFx0dGhpcy5zdGF0ZS5pc0Nvbm5lY3RlZCA9IHRoaXMuaXNDb25uZWN0ZWQ7XHJcblx0XHR0aGlzLnN0YXRlLmlzUmVjb25uZWN0aW5nID0gdGhpcy5pc1JlY29ubmVjdGluZztcclxuXHR9XHJcblxyXG5cdG9uU29ja2V0T3BlbigpIHtcclxuXHRcdHRoaXMucmVjb25uZWN0QXR0ZW1wdHMgPSAwO1xyXG5cdFx0dGhpcy5pc1JlY29ubmVjdGluZyA9IGZhbHNlO1xyXG5cdFx0dGhpcy51cGRhdGVTdGF0ZSgpO1xyXG5cdH1cclxuXHJcblx0b25Tb2NrZXRFcnJvcigpIHtcclxuXHRcdHRoaXMudXBkYXRlU3RhdGUoKTtcclxuXHR9XHJcblxyXG5cdG9uU29ja2V0TWVzc2FnZSgpIHtcclxuXHRcdC8vXHJcblx0fVxyXG5cclxuXHRnZXQgaXNDb25uZWN0aW5nKCkge1xyXG5cdFx0cmV0dXJuIHRoaXMuc29ja2V0ICYmIHRoaXMuc29ja2V0LnJlYWR5U3RhdGUgPT09IFdlYlNvY2tldC5DT05ORUNUSU5HO1xyXG5cdH1cclxuXHJcblx0Z2V0IGlzQ29ubmVjdGVkKCkge1xyXG5cdFx0cmV0dXJuIHRoaXMuc29ja2V0ICYmIHRoaXMuc29ja2V0LnJlYWR5U3RhdGUgPT09IFdlYlNvY2tldC5PUEVOO1xyXG5cdH1cclxuXHJcblx0Z2V0IGlzQ2xvc2luZygpIHtcclxuXHRcdHJldHVybiB0aGlzLnNvY2tldCAmJiB0aGlzLnNvY2tldC5yZWFkeVN0YXRlID09PSBXZWJTb2NrZXQuQ0xPU0lORztcclxuXHR9XHJcblxyXG5cdGdldCBpc0Nsb3NlZCgpIHtcclxuXHRcdHJldHVybiAhdGhpcy5zb2NrZXQgfHwgdGhpcy5zb2NrZXQucmVhZHlTdGF0ZSA9PT0gV2ViU29ja2V0LkNMT1NFRDtcclxuXHR9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IG5ldyBDb25uZWN0aW9uKHNvY2tldEJhc2VVcmwpOyJdfQ==
