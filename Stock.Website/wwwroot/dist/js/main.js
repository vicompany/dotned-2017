(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var definition = {
	name: 'chart',
	template: '#template-chart',

	props: {
		symbol: { default: null }
	},
	data: function data() {
		return {
			isLoaded: false,
			isDisplayed: false
		};
	},
	mounted: function mounted() {
		console.log('m', this.isLoaded);

		this.isLoaded = true;
	}
};

exports.default = definition;

},{}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _api = require('../utils/api');

var _api2 = _interopRequireDefault(_api);

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
			refreshInterval: 2000, // MS
			selectedSymbol: null,
			symbols: 'AAL, AAPL, ADBE, ADI, ADP, ADSK, AKAM, ALXN, AMAT, AMGN, AMZN, ATVI, AVGO, BIDU, BIIB, BMRN, CA, CELG, CERN, CHKP, CHTR, CTRP, CTAS, CSCO, CTXS, CMCSA, COST, CSX, CTSH, DISCA, DISCK, DISH, DLTR, EA, EBAY, ESRX, EXPE, FAST, FB, FISV, FOX, FOXA, GILD, GOOG, HAS, HSIC, HOLX, ILMN, INCY, INTC, INTU, ISRG, JD, KLAC, KHC, LBTYA, LILA, LILAK, LRCX, QVCA, LVNTA, MAR, MCHP, MDLZ, MNST, MSFT, MU, MXIM, MYL, NCLH, NFLX, NVDA, ORLY, PAYX, PCAR, PCLN, QCOM, REGN, ROST, SBAC, STX, SHPG, SIRI, SWKS, SYMC, TMUS, TRIP, TSCO, TSLA, TXN, ULTA, VIAB, VOD, VRSK, VRTX, WBA, WDC, XLNX, XRAY, YHOO'.split(', '),
			tickers: [{ symbol: 'AAPL', isExpanded: true }, { symbol: 'YHOO', isExpanded: false }],

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
		subscribe: function subscribe() {
			this.fetchQuote();
		},
		fetchQuote: function fetchQuote() {
			var _this = this;

			_api2.default.fetchQuotes(this.tickerSymbols).then(function (quotes) {
				_this.$set(_this, 'quotes', quotes);
			}).catch(console.warn).then(this.queueFetch);
		},
		queueFetch: function queueFetch() {
			this.quoteTimeoutId = setTimeout(this.fetchQuote, this.refreshInterval);
		}
	}
};

exports.default = definition;

},{"../utils/api":5,"./ticker":3}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _chart = require('./chart');

var _chart2 = _interopRequireDefault(_chart);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
		chart: _chart2.default
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

},{"./chart":1}],4:[function(require,module,exports){
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

},{"./components/ticker-overview":2}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
/* globals Promise: false, */

var YAHOO_BASE_URL = 'https://query.yahooapis.com/v1/public/yql';
var QUANDL_BASE_URL = 'https://www.quandl.com/api/v3/datasets/WIKI';
var QUANDL_KEY = '2cEE3R9jWKWJhJC_fBra';
var DEFAULT_PARAMS = {
	format: 'json',
	env: 'store://datatables.org/alltableswithkeys'
};

var buildQuoteUrl = function buildQuoteUrl(symbols) {
	var params = Object.assign({}, DEFAULT_PARAMS, {
		q: 'select * from yahoo.finance.quotes where symbol in ("' + symbols.join(',') + '")'
	});

	var query = buildQueryString(params);
	var url = YAHOO_BASE_URL + '?' + query;

	return url;
};

var buildQuandlUrl = function buildQuandlUrl(symbol, params) {
	// https://www.quandl.com/api/v3/datasets/WIKI/
	var query = buildQueryString(Object.assign(params, { key: QUANDL_KEY }));

	return QUANDL_BASE_URL + '/' + symbol + '?' + query;
};

var buildQueryString = function buildQueryString(params) {
	return Object.keys(params).filter(function (key) {
		return params[key] !== null;
	}).map(function (key) {
		return key + '=' + encodeURIComponent(params[key]);
	}).join('&');
};

/**
 * Fetch quotes from alphavantage for symbol
 *
 * @param {Array} symbol The name of the equity
 */
var fetchQuotes = function fetchQuotes(symbols) {
	symbols = Array.isArray(symbols) ? symbols : [symbols];

	var url = buildQuoteUrl(symbols);

	return fetch(url).then(function (r) {
		if (!r.ok) {
			return Promise.reject('Not OK');
		}

		return r;
	}).then(function (r) {
		return r.json();
	}).then(function (r) {
		var quotes = r.query.results.quote;
		quotes = Array.isArray(quotes) ? quotes : [quotes];

		var quotesObj = {};

		quotes.forEach(function (q) {
			quotesObj[q.Symbol] = q;
		});

		return quotesObj;
	});
};

var fetchChartData = function fetchChartData(symbol) {
	var collapse = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'monthly';
	var startDate = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
	var endDate = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

	var url = buildQuandlUrl(symbol, {
		collapse: collapse,
		start_date: startDate,
		end_date: endDate
	});

	console.log(url);
	// fetch(url)
	// 	.then(r => r.json())
};

fetchChartData('AAPL', null, null, '1981-02-02');

exports.default = {
	fetchQuotes: fetchQuotes,
	fetchChartData: fetchChartData
};

/**
 * quandl
 * https://www.quandl.com/api/v3/datasets/WIKI/AAPL.json?start_date=1985-05-01&end_date=1997-07-01&order=asc&column_index=4&collapse=quarterly&transformation=rdiff
 *
 * https://www.quandl.com/api/v3/datasets/WIKI/FB.json?api_key=2cEE3R9jWKWJhJC_fBra
 * https://www.quandl.com/api/v3/datasets/EURONEXT/ASML.json?api_key=2cEE3R9jWKWJhJC_fBra
 * https://www.quandl.com/api/v3/datasets/WIKI/ADP.json?api_key=2cEE3R9jWKWJhJC_fBra&end_date=2014-03-01&collapse=annual
 */

/**
 * Google
 * http://www.jarloo.com/real-time-google-stock-api/
 * http://finance.google.com/finance/info?client=ig&q=NASDAQ%3AAAPL,GOOG
 */

},{}]},{},[4])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzb3VyY2VcXGpzXFxjb21wb25lbnRzXFxjaGFydC5qcyIsInNvdXJjZVxcanNcXGNvbXBvbmVudHNcXHRpY2tlci1vdmVydmlldy5qcyIsInNvdXJjZVxcanNcXGNvbXBvbmVudHNcXHRpY2tlci5qcyIsInNvdXJjZVxcanNcXG1haW4uanMiLCJzb3VyY2VcXGpzXFx1dGlsc1xcYXBpLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7O0FDQ0EsSUFBTSxhQUFhO0FBQ2xCLE9BQU0sT0FEWTtBQUVsQixXQUFVLGlCQUZROztBQUlsQixRQUFPO0FBQ04sVUFBUSxFQUFFLFNBQVMsSUFBWDtBQURGLEVBSlc7QUFPbEIsS0FQa0Isa0JBT1g7QUFDTixTQUFPO0FBQ04sYUFBVSxLQURKO0FBRU4sZ0JBQWE7QUFGUCxHQUFQO0FBSUEsRUFaaUI7QUFjbEIsUUFka0IscUJBY1I7QUFDVCxVQUFRLEdBQVIsQ0FBWSxHQUFaLEVBQWlCLEtBQUssUUFBdEI7O0FBRUEsT0FBSyxRQUFMLEdBQWdCLElBQWhCO0FBQ0E7QUFsQmlCLENBQW5COztrQkFxQmUsVTs7Ozs7Ozs7O0FDdEJmOzs7O0FBQ0E7Ozs7OztBQUVBLElBQU0sYUFBYTtBQUNsQixPQUFNLGlCQURZOztBQUdsQixhQUFZO0FBQ1g7QUFEVyxFQUhNOztBQU9sQixLQVBrQixrQkFPWDtBQUNOLFNBQU87QUFDTixvQkFBaUIsSUFEWCxFQUNpQjtBQUN2QixtQkFBZ0IsSUFGVjtBQUdOLFlBQVMsdWtCQUF1a0IsS0FBdmtCLENBQTZrQixJQUE3a0IsQ0FISDtBQUlOLFlBQVMsQ0FDUixFQUFFLFFBQVEsTUFBVixFQUFrQixZQUFZLElBQTlCLEVBRFEsRUFFUixFQUFFLFFBQVEsTUFBVixFQUFrQixZQUFZLEtBQTlCLEVBRlEsQ0FKSDs7QUFTTixXQUFRO0FBVEYsR0FBUDtBQVdBLEVBbkJpQjs7O0FBcUJsQixXQUFVO0FB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QVIsQ0FBZSxRQUFmLENBQVA7QUFDQTs7QUFFRCxTQUFPLENBQVA7QUFDQSxFQVBLLEVBUUwsSUFSSyxDQVFBO0FBQUEsU0FBSyxFQUFFLElBQUYsRUFBTDtBQUFBLEVBUkEsRUFTTCxJQVRLLENBU0EsVUFBQyxDQUFELEVBQU87QUFDWixNQUFJLFNBQVMsRUFBRSxLQUFGLENBQVEsT0FBUixDQUFnQixLQUE3QjtBQUNBLFdBQVMsTUFBTSxPQUFOLENBQWMsTUFBZCxJQUF3QixNQUF4QixHQUFpQyxDQUFDLE1BQUQsQ0FBMUM7O0FBRUEsTUFBTSxZQUFZLEVBQWxCOztBQUVBLFNBQU8sT0FBUCxDQUFlLFVBQUMsQ0FBRCxFQUFPO0FBQ3JCLGFBQVUsRUFBRSxNQUFaLElBQXNCLENBQXRCO0FBQ0EsR0FGRDs7QUFJQSxTQUFPLFNBQVA7QUFDQSxFQXBCSyxDQUFQO0FBcUJBLENBMUJEOztBQTRCQSxJQUFNLGlCQUFpQixTQUFqQixjQUFpQixDQUFDLE1BQUQsRUFBb0U7QUFBQSxLQUEzRCxRQUEyRCx1RUFBaEQsU0FBZ0Q7QUFBQSxLQUFyQyxTQUFxQyx1RUFBekIsSUFBeUI7QUFBQSxLQUFuQixPQUFtQix1RUFBVCxJQUFTOztBQUMxRixLQUFNLE1BQU0sZUFBZSxNQUFmLEVBQXVCO0FBQ2xDLG9CQURrQztBQUVsQyxjQUFZLFNBRnNCO0FBR2xDLFlBQVU7QUFId0IsRUFBdkIsQ0FBWjs7QUFNQSxTQUFRLEdBQVIsQ0FBWSxHQUFaO0FBQ0E7QUFDQTtBQUNBLENBVkQ7O0FBWUEsZUFBZSxNQUFmLEVBQXVCLElBQXZCLEVBQTZCLElBQTdCLEVBQW1DLFlBQW5DOztrQkFFZTtBQUNkLHlCQURjO0FBRWQ7QUFGYyxDOztBQUtmOzs7Ozs7Ozs7QUFTQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcclxuY29uc3QgZGVmaW5pdGlvbiA9IHtcclxuXHRuYW1lOiAnY2hhcnQnLFxyXG5cdHRlbXBsYXRlOiAnI3RlbXBsYXRlLWNoYXJ0JyxcclxuXHJcblx0cHJvcHM6IHtcclxuXHRcdHN5bWJvbDogeyBkZWZhdWx0OiBudWxsIH0sXHJcblx0fSxcclxuXHRkYXRhKCkge1xyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0aXNMb2FkZWQ6IGZhbHNlLFxyXG5cdFx0XHRpc0Rpc3BsYXllZDogZmFsc2UsXHJcblx0XHR9O1xyXG5cdH0sXHJcblxyXG5cdG1vdW50ZWQoKSB7XHJcblx0XHRjb25zb2xlLmxvZygnbScsIHRoaXMuaXNMb2FkZWQpO1xyXG5cclxuXHRcdHRoaXMuaXNMb2FkZWQgPSB0cnVlO1xyXG5cdH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBkZWZpbml0aW9uO1xyXG4iLCJpbXBvcnQgYXBpIGZyb20gJy4uL3V0aWxzL2FwaSc7XHJcbmltcG9ydCB0aWNrZXIgZnJvbSAnLi90aWNrZXInO1xyXG5cclxuY29uc3QgZGVmaW5pdGlvbiA9IHtcclxuXHRuYW1lOiAndGlja2VyLW92ZXJ2aWV3JyxcclxuXHJcblx0Y29tcG9uZW50czoge1xyXG5cdFx0dGlja2VyLFxyXG5cdH0sXHJcblxyXG5cdGRhdGEoKSB7XHJcblx0XHRyZXR1cm4ge1xyXG5cdFx0XHRyZWZyZXNoSW50ZXJ2YWw6IDIwMDAsIC8vIE1TXHJcblx0XHRcdHNlbGVjdGVkU3ltYm9sOiBudWxsLFxyXG5cdFx0XHRzeW1ib2xzOiAnQUFMLCBBQVBMLCBBREJFLCBBREksIEFEUCwgQURTSywgQUtBTSwgQUxYTiwgQU1BVCwgQU1HTiwgQU1aTiwgQVRWSSwgQVZHTywgQklEVSwgQklJQiwgQk1STiwgQ0EsIENFTEcsIENFUk4sIENIS1AsIENIVFIsIENUUlAsIENUQVMsIENTQ08sIENUWFMsIENNQ1NBLCBDT1NULCBDU1gsIENUU0gsIERJU0NBLCBESVNDSywgRElTSCwgRExUUiwgRUEsIEVCQVksIEVTUlgsIEVYUEUsIEZBU1QsIEZCLCBGSVNWLCBGT1gsIEZPWEEsIEdJTEQsIEdPT0csIEhBUywgSFNJQywgSE9MWCwgSUxNTiwgSU5DWSwgSU5UQywgSU5UVSwgSVNSRywgSkQsIEtMQUMsIEtIQywgTEJUWUEsIExJTEEsIExJTEFLLCBMUkNYLCBRVkNBLCBMVk5UQSwgTUFSLCBNQ0hQLCBNRExaLCBNTlNULCBNU0ZULCBNVSwgTVhJTSwgTVlMLCBOQ0xILCBORkxYLCBOVkRBLCBPUkxZLCBQQVlYLCBQQ0FSLCBQQ0xOLCBRQ09NLCBSRUdOLCBST1NULCBTQkFDLCBTVFgsIFNIUEcsIFNJUkksIFNXS1MsIFNZTUMsIFRNVVMsIFRSSVAsIFRTQ08sIFRTTEEsIFRYTiwgVUxUQSwgVklBQiwgVk9ELCBWUlNLLCBWUlRYLCBXQkEsIFdEQywgWExOWCwgWFJBWSwgWUhPTycuc3BsaXQoJywgJyksXHJcblx0XHRcdHRpY2tlcnM6IFtcclxuXHRcdFx0XHR7IHN5bWJvbDogJ0FBUEwnLCBpc0V4cGFuZGVkOiB0cnVlIH0sXHJcblx0XHRcdFx0eyBzeW1ib2w6ICdZSE9PJywgaXNFeHBhbmRlZDogZmFsc2UgfSxcclxuXHRcdFx0XSxcclxuXHJcblx0XHRcdHF1b3RlczogeyB9LFxyXG5cdFx0fTtcclxuXHR9LFxyXG5cclxuXHRjb21wdXRlZDoge1xyXG5cdFx0dGlja2VyU3ltYm9scygpIHtcclxuXHRcdFx0cmV0dXJuIHRoaXMudGlja2Vycy5tYXAodGlja2VyID0+IHRpY2tlci5zeW1ib2wpO1xyXG5cdFx0fSxcclxuXHR9LFxyXG5cclxuXHR3YXRjaDoge1xyXG5cdFx0dGlja2VycygpIHtcclxuXHRcdFx0dGhpcy5zdWJzY3JpYmUoKTtcclxuXHRcdH0sXHJcblx0fSxcclxuXHJcblx0bW91bnRlZCgpIHtcclxuXHRcdHRoaXMuc3Vic2NyaWJlKCk7XHJcblx0fSxcclxuXHJcblx0bWV0aG9kczoge1xyXG5cdFx0dGlja2VyRXhpc3RzKHN5bWJvbCkge1xyXG5cdFx0XHRyZXR1cm4gdGhpcy50aWNrZXJzLmZpbHRlcih0ID0+IHQuc3ltYm9sID09PSBzeW1ib2wpLmxlbmd0aCAhPT0gMDtcclxuXHRcdH0sXHJcblxyXG5cdFx0b25UaWNrZXJTZWxlY3RlZCgpIHtcclxuXHRcdFx0dGhpcy5hZGRUaWNrZXIodGhpcy5zZWxlY3RlZFN5bWJvbCk7XHJcblx0XHRcdHRoaXMuc2VsZWN0ZWRTeW1ib2wgPSBudWxsO1xyXG5cdFx0fSxcclxuXHJcblx0XHRhZGRUaWNrZXIoc3ltYm9sLCBpc0V4cGFuZGVkID0gZmFsc2UpIHtcclxuXHRcdFx0dGhpcy50aWNrZXJzLnB1c2goe1xyXG5cdFx0XHRcdHN5bWJvbCxcclxuXHRcdFx0XHRpc0V4cGFuZGVkLFxyXG5cdFx0XHR9KTtcclxuXHRcdH0sXHJcblxyXG5cdFx0cmVtb3ZlKGluZGV4KSB7XHJcblx0XHRcdHRoaXMudGlja2Vycy5zcGxpY2UoaW5kZXgsIDEpO1xyXG5cdFx0fSxcclxuXHJcblx0XHR0b2dnbGVFeHBhbmRlZChpbmRleCkge1xyXG5cdFx0XHR0aGlzLnRpY2tlcnNbaW5kZXhdLmlzRXhwYW5kZWQgPSAhdGhpcy50aWNrZXJzW2luZGV4XS5pc0V4cGFuZGVkO1xyXG5cdFx0fSxcclxuXHJcblx0XHRzdWJzY3JpYmUoKSB7XHJcblx0XHRcdHRoaXMuZmV0Y2hRdW90ZSgpO1xyXG5cdFx0fSxcclxuXHJcblx0XHRmZXRjaFF1b3RlKCkge1xyXG5cdFx0XHRhcGkuZmV0Y2hRdW90ZXModGhpcy50aWNrZXJTeW1ib2xzKVxyXG5cdFx0XHRcdC50aGVuKChxdW90ZXMpID0+IHtcclxuXHRcdFx0XHRcdHRoaXMuJHNldCh0aGlzLCAncXVvdGVzJywgcXVvdGVzKTtcclxuXHRcdFx0XHR9KVxyXG5cdFx0XHRcdC5jYXRjaChjb25zb2xlLndhcm4pXHJcblx0XHRcdFx0LnRoZW4odGhpcy5xdWV1ZUZldGNoKTtcclxuXHRcdH0sXHJcblxyXG5cdFx0cXVldWVGZXRjaCgpIHtcclxuXHRcdFx0dGhpcy5xdW90ZVRpbWVvdXRJZCA9IHNldFRpbWVvdXQodGhpcy5mZXRjaFF1b3RlLCB0aGlzLnJlZnJlc2hJbnRlcnZhbCk7XHJcblx0XHR9LFxyXG5cdH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBkZWZpbml0aW9uO1xyXG4iLCJpbXBvcnQgY2hhcnQgZnJvbSAnLi9jaGFydCc7XHJcblxyXG5jb25zdCBzdGF0ZXMgPSB7XHJcblx0cGVuZGluZzogJ3BlbmRpbmcnLFxyXG5cdGxvYWRpbmc6ICdsb2FkaW5nJyxcclxufTtcclxuXHJcbmNvbnN0IE5BID0gJy0nO1xyXG5cclxuY29uc3QgUVVPVEVfREVGQVVMVCA9IHtcclxuXHRCaWQ6IG51bGwsXHJcblx0QXNrOiBudWxsLFxyXG5cdEF2ZXJhZ2VEYWlseVZvbHVtZTogbnVsbCxcclxuXHRDdXJyZW5jeTogTkEsXHJcblx0RGF5c0xvdzogTkEsXHJcblx0RGF5c0hpZ2g6IE5BLFxyXG5cdExhc3RUcmFkZURhdGU6IE5BLFxyXG5cdExhc3RUcmFkZVByaWNlT25seTogTkEsXHJcblx0TmFtZTogTkEsXHJcblx0TWFya2V0Q2FwaXRhbGl6YXRpb246IE5BLFxyXG5cdEVCSVREQTogTkEsXHJcbn07XHJcblxyXG5jb25zdCBkZWZpbml0aW9uID0ge1xyXG5cdHRlbXBsYXRlOiAnI3RlbXBsYXRlLXRpY2tlcicsXHJcblx0bmFtZTogJ3RpY2tlcicsXHJcblxyXG5cdGNvbXBvbmVudHM6IHtcclxuXHRcdGNoYXJ0LFxyXG5cdH0sXHJcblxyXG5cdHByb3BzOiB7XHJcblx0XHRpbmRleDogeyBkZWZhdWx0OiAwIH0sXHJcblx0XHRzeW1ib2w6IHsgZGVmYXVsdDogbnVsbCB9LFxyXG5cdFx0aXNFeHBhbmRlZDogeyBkZWZhdWx0OiBmYWxzZSB9LFxyXG5cdFx0cGFzc2VkUXVvdGVzOiB7IGRlZmF1bHQ6IHsgfSB9LFxyXG5cdFx0cmVmcmVzaEludGVydmFsOiB7IGRlZmF1bHQ6IDEwMDAgfSwgLy8gaW4gTVNcclxuXHR9LFxyXG5cclxuXHRkYXRhKCkge1xyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0c3RhdGU6IHN0YXRlcy5wZW5kaW5nLFxyXG5cdFx0XHRxdW90ZVRpbWVvdXRJZDogbnVsbCxcclxuXHRcdFx0aXNQb3NpdGl2ZVRpY2s6IGZhbHNlLFxyXG5cdFx0XHRpc05lZ2F0aXZlVGljazogZmFsc2UsXHJcblx0XHR9O1xyXG5cdH0sXHJcblxyXG5cdGNvbXB1dGVkOiB7XHJcblx0XHRxdW90ZSgpIHtcclxuXHRcdFx0cmV0dXJuIHRoaXMucGFzc2VkUXVvdGVzW3RoaXMuc3ltYm9sXSB8fCBRVU9URV9ERUZBVUxUO1xyXG5cdFx0fSxcclxuXHJcblx0XHRiaWQoKSB7XHJcblx0XHRcdGlmICghdGhpcy5xdW90ZS5CaWQpIHtcclxuXHRcdFx0XHRyZXR1cm4gbnVsbDtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0cmV0dXJuIHBhcnNlRmxvYXQodGhpcy5xdW90ZS5CaWQpO1xyXG5cdFx0fSxcclxuXHJcblx0XHRhc2soKSB7XHJcblx0XHRcdGlmICghdGhpcy5xdW90ZS5Bc2spIHtcclxuXHRcdFx0XHRyZXR1cm4gbnVsbDtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0cmV0dXJuIHBhcnNlRmxvYXQodGhpcy5xdW90ZS5Bc2spO1xyXG5cdFx0fSxcclxuXHJcblx0XHRxdW90ZU1pZCgpIHtcclxuXHRcdFx0aWYgKCF0aGlzLmJpZCB8fCAhdGhpcy5hc2spIHtcclxuXHRcdFx0XHRyZXR1cm4gJy0nO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRyZXR1cm4gKCh0aGlzLmJpZCArIHRoaXMuYXNrKSAqIDAuNSkudG9QcmVjaXNpb24oNik7XHJcblx0XHR9LFxyXG5cclxuXHRcdHRvZ2dsZUJ1dHRvblRleHQoKSB7XHJcblx0XHRcdHJldHVybiB0aGlzLmlzRXhwYW5kZWQgPyAnY29sbGFwc2UnIDogJ2V4cGFuZCc7XHJcblx0XHR9LFxyXG5cdH0sXHJcblxyXG5cdHdhdGNoOiB7XHJcblx0XHRxdW90ZU1pZChuZXdWYWwsIG9sZFZhbCkge1xyXG5cdFx0XHRpZiAoIW9sZFZhbCkge1xyXG5cdFx0XHRcdHJldHVybjtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0dGhpcy5yZXNldFRpY2tTdGF0ZXMoKTtcclxuXHJcblx0XHRcdGlmIChuZXdWYWwgPiBvbGRWYWwpIHtcclxuXHRcdFx0XHR0aGlzLmlzUG9zaXRpdmVUaWNrID0gdHJ1ZTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHR0aGlzLmlzTmVnYXRpdmVUaWNrID0gdHJ1ZTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0c2V0VGltZW91dCh0aGlzLnJlc2V0VGlja1N0YXRlcywgNTAwKTtcclxuXHRcdH0sXHJcblx0fSxcclxuXHJcblx0YmVmb3JlRGVzdHJveSgpIHtcclxuXHRcdGNsZWFyVGltZW91dCh0aGlzLnF1b3RlVGltZW91dElkKTtcclxuXHR9LFxyXG5cclxuXHRtZXRob2RzOiB7XHJcblx0XHRyZXNldFRpY2tTdGF0ZXMoKSB7XHJcblx0XHRcdHRoaXMuaXNQb3NpdGl2ZVRpY2sgPSBmYWxzZTtcclxuXHRcdFx0dGhpcy5pc05lZ2F0aXZlVGljayA9IGZhbHNlO1xyXG5cdFx0fSxcclxuXHJcblx0XHR0b2dnbGVFeHBhbmRlZCgpIHtcclxuXHRcdFx0dGhpcy4kZW1pdCgndG9nZ2xlLWV4cGFuZGVkJywgdGhpcy5pbmRleCk7XHJcblx0XHR9LFxyXG5cclxuXHRcdHJlbW92ZSgpIHtcclxuXHRcdFx0dGhpcy4kZW1pdCgncmVtb3ZlJywgdGhpcy5pbmRleCk7XHJcblx0XHR9LFxyXG5cdH0sXHJcblxyXG5cdGZpbHRlcnM6IHtcclxuXHRcdGZvcm1hdE51bWJlcihudW0pIHtcclxuXHRcdFx0aWYgKCFudW0pIHtcclxuXHRcdFx0XHRyZXR1cm4gTkE7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGNvbnN0IGxvY2FsZSA9ICdFTi1lbic7XHJcblx0XHRcdGNvbnN0IHByZWNpc2lvbiA9IDI7XHJcblxyXG5cdFx0XHRudW0gPSBwYXJzZUZsb2F0KG51bSk7XHJcblxyXG5cdFx0XHRyZXR1cm4gbnVtLnRvTG9jYWxlU3RyaW5nKGxvY2FsZSwge1xyXG5cdFx0XHRcdG1pbmltdW1GcmFjdGlvbkRpZ2l0czogcHJlY2lzaW9uLFxyXG5cdFx0XHRcdG1heGltdW1GcmFjdGlvbkRpZ2l0czogcHJlY2lzaW9uLFxyXG5cdFx0XHR9KTtcclxuXHRcdH0sXHJcblx0fVxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5pdGlvbjtcclxuIiwiLyogZ2xvYmFscyBWdWU6IGZhbHNlLCAqL1xyXG5cclxuaW1wb3J0IHRpY2tlck92ZXJ2aWV3IGZyb20gJy4vY29tcG9uZW50cy90aWNrZXItb3ZlcnZpZXcnO1xyXG5cclxuXHJcbmNvbnN0IGluc3RhbmNlID0gbmV3IFZ1ZSh7XHJcblx0ZWw6ICcuanMtaW5zdGFuY2UnLFxyXG5cdG5hbWU6ICdyb290LWluc3RhbmNlJyxcclxuXHJcblx0Y29tcG9uZW50czoge1xyXG5cdFx0dGlja2VyT3ZlcnZpZXcsXHJcblx0fSxcclxufSk7XHJcblxyXG53aW5kb3cuaW5zdGFuY2UgPSBpbnN0YW5jZTtcclxuIiwiLyogZ2xvYmFscyBQcm9taXNlOiBmYWxzZSwgKi9cclxuXHJcbmNvbnN0IFlBSE9PX0JBU0VfVVJMID0gJ2h0dHBzOi8vcXVlcnkueWFob29hcGlzLmNvbS92MS9wdWJsaWMveXFsJztcclxuY29uc3QgUVVBTkRMX0JBU0VfVVJMID0gJ2h0dHBzOi8vd3d3LnF1YW5kbC5jb20vYXBpL3YzL2RhdGFzZXRzL1dJS0knO1xyXG5jb25zdCBRVUFORExfS0VZID0gJzJjRUUzUjlqV0tXSmhKQ19mQnJhJztcclxuY29uc3QgREVGQVVMVF9QQVJBTVMgPSB7XHJcblx0Zm9ybWF0OiAnanNvbicsXHJcblx0ZW52OiAnc3RvcmU6Ly9kYXRhdGFibGVzLm9yZy9hbGx0YWJsZXN3aXRoa2V5cycsXHJcbn07XHJcblxyXG5jb25zdCBidWlsZFF1b3RlVXJsID0gKHN5bWJvbHMpID0+IHtcclxuXHRjb25zdCBwYXJhbXMgPSBPYmplY3QuYXNzaWduKHt9LCBERUZBVUxUX1BBUkFNUywge1xyXG5cdFx0cTogYHNlbGVjdCAqIGZyb20geWFob28uZmluYW5jZS5xdW90ZXMgd2hlcmUgc3ltYm9sIGluIChcIiR7c3ltYm9scy5qb2luKCcsJyl9XCIpYCxcclxuXHR9KTtcclxuXHJcblx0Y29uc3QgcXVlcnkgPSBidWlsZFF1ZXJ5U3RyaW5nKHBhcmFtcyk7XHJcblx0Y29uc3QgdXJsID0gYCR7WUFIT09fQkFTRV9VUkx9PyR7cXVlcnl9YDtcclxuXHJcblx0cmV0dXJuIHVybDtcclxufTtcclxuXHJcblxyXG5jb25zdCBidWlsZFF1YW5kbFVybCA9IChzeW1ib2wsIHBhcmFtcykgPT4ge1xyXG5cdC8vIGh0dHBzOi8vd3d3LnF1YW5kbC5jb20vYXBpL3YzL2RhdGFzZXRzL1dJS0kvXHJcblx0Y29uc3QgcXVlcnkgPSBidWlsZFF1ZXJ5U3RyaW5nKE9iamVjdC5hc3NpZ24ocGFyYW1zLCB7IGtleTogUVVBTkRMX0tFWSB9KSk7XHJcblxyXG5cdHJldHVybiBgJHtRVUFORExfQkFTRV9VUkx9LyR7c3ltYm9sfT8ke3F1ZXJ5fWA7XHJcbn07XHJcblxyXG5jb25zdCBidWlsZFF1ZXJ5U3RyaW5nID0gKHBhcmFtcykgPT4gT2JqZWN0LmtleXMocGFyYW1zKVxyXG5cdC5maWx0ZXIoa2V5ID0+IHBhcmFtc1trZXldICE9PSBudWxsKVxyXG5cdC5tYXAoa2V5ID0+IGAke2tleX09JHtlbmNvZGVVUklDb21wb25lbnQocGFyYW1zW2tleV0pfWApLmpvaW4oJyYnKTtcclxuXHJcbi8qKlxyXG4gKiBGZXRjaCBxdW90ZXMgZnJvbSBhbHBoYXZhbnRhZ2UgZm9yIHN5bWJvbFxyXG4gKlxyXG4gKiBAcGFyYW0ge0FycmF5fSBzeW1ib2wgVGhlIG5hbWUgb2YgdGhlIGVxdWl0eVxyXG4gKi9cclxuY29uc3QgZmV0Y2hRdW90ZXMgPSAoc3ltYm9scykgPT4ge1xyXG5cdHN5bWJvbHMgPSBBcnJheS5pc0FycmF5KHN5bWJvbHMpID8gc3ltYm9scyA6IFtzeW1ib2xzXTtcclxuXHJcblx0Y29uc3QgdXJsID0gYnVpbGRRdW90ZVVybChzeW1ib2xzKTtcclxuXHJcblx0cmV0dXJuIGZldGNoKHVybClcclxuXHRcdC50aGVuKChyKSA9PiB7XHJcblx0XHRcdGlmICghci5vaykge1xyXG5cdFx0XHRcdHJldHVybiBQcm9taXNlLnJlamVjdCgnTm90IE9LJyk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHJldHVybiByO1xyXG5cdFx0fSlcclxuXHRcdC50aGVuKHIgPT4gci5qc29uKCkpXHJcblx0XHQudGhlbigocikgPT4ge1xyXG5cdFx0XHRsZXQgcXVvdGVzID0gci5xdWVyeS5yZXN1bHRzLnF1b3RlO1xyXG5cdFx0XHRxdW90ZXMgPSBBcnJheS5pc0FycmF5KHF1b3RlcykgPyBxdW90ZXMgOiBbcXVvdGVzXTtcclxuXHJcblx0XHRcdGNvbnN0IHF1b3Rlc09iaiA9IHt9O1xyXG5cclxuXHRcdFx0cXVvdGVzLmZvckVhY2goKHEpID0+IHtcclxuXHRcdFx0XHRxdW90ZXNPYmpbcS5TeW1ib2xdID0gcTtcclxuXHRcdFx0fSk7XHJcblxyXG5cdFx0XHRyZXR1cm4gcXVvdGVzT2JqO1xyXG5cdFx0fSk7XHJcbn07XHJcblxyXG5jb25zdCBmZXRjaENoYXJ0RGF0YSA9IChzeW1ib2wsIGNvbGxhcHNlID0gJ21vbnRobHknLCBzdGFydERhdGUgPSBudWxsLCBlbmREYXRlID0gbnVsbCkgPT4ge1xyXG5cdGNvbnN0IHVybCA9IGJ1aWxkUXVhbmRsVXJsKHN5bWJvbCwge1xyXG5cdFx0Y29sbGFwc2UsXHJcblx0XHRzdGFydF9kYXRlOiBzdGFydERhdGUsXHJcblx0XHRlbmRfZGF0ZTogZW5kRGF0ZSxcclxuXHR9KTtcclxuXHJcblx0Y29uc29sZS5sb2codXJsKTtcclxuXHQvLyBmZXRjaCh1cmwpXHJcblx0Ly8gXHQudGhlbihyID0+IHIuanNvbigpKVxyXG59O1xyXG5cclxuZmV0Y2hDaGFydERhdGEoJ0FBUEwnLCBudWxsLCBudWxsLCAnMTk4MS0wMi0wMicpO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG5cdGZldGNoUXVvdGVzLFxyXG5cdGZldGNoQ2hhcnREYXRhLFxyXG59O1xyXG5cclxuLyoqXHJcbiAqIHF1YW5kbFxyXG4gKiBodHRwczovL3d3dy5xdWFuZGwuY29tL2FwaS92My9kYXRhc2V0cy9XSUtJL0FBUEwuanNvbj9zdGFydF9kYXRlPTE5ODUtMDUtMDEmZW5kX2RhdGU9MTk5Ny0wNy0wMSZvcmRlcj1hc2MmY29sdW1uX2luZGV4PTQmY29sbGFwc2U9cXVhcnRlcmx5JnRyYW5zZm9ybWF0aW9uPXJkaWZmXHJcbiAqXHJcbiAqIGh0dHBzOi8vd3d3LnF1YW5kbC5jb20vYXBpL3YzL2RhdGFzZXRzL1dJS0kvRkIuanNvbj9hcGlfa2V5PTJjRUUzUjlqV0tXSmhKQ19mQnJhXHJcbiAqIGh0dHBzOi8vd3d3LnF1YW5kbC5jb20vYXBpL3YzL2RhdGFzZXRzL0VVUk9ORVhUL0FTTUwuanNvbj9hcGlfa2V5PTJjRUUzUjlqV0tXSmhKQ19mQnJhXHJcbiAqIGh0dHBzOi8vd3d3LnF1YW5kbC5jb20vYXBpL3YzL2RhdGFzZXRzL1dJS0kvQURQLmpzb24/YXBpX2tleT0yY0VFM1I5aldLV0poSkNfZkJyYSZlbmRfZGF0ZT0yMDE0LTAzLTAxJmNvbGxhcHNlPWFubnVhbFxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBHb29nbGVcclxuICogaHR0cDovL3d3dy5qYXJsb28uY29tL3JlYWwtdGltZS1nb29nbGUtc3RvY2stYXBpL1xyXG4gKiBodHRwOi8vZmluYW5jZS5nb29nbGUuY29tL2ZpbmFuY2UvaW5mbz9jbGllbnQ9aWcmcT1OQVNEQVElM0FBQVBMLEdPT0dcclxuICovXHJcbiJdfQ==
