/* globals Promise: false, */

const YAHOO_BASE_URL = 'https://query.yahooapis.com/v1/public/yql';
const QUANDL_BASE_URL = 'https://www.quandl.com/api/v3/datasets/WIKI';
const QUANDL_KEY = '2cEE3R9jWKWJhJC_fBra';
const DEFAULT_PARAMS = {
	format: 'json',
	env: 'store://datatables.org/alltableswithkeys',
};

const buildQuoteUrl = (symbols) => {
	const params = Object.assign({}, DEFAULT_PARAMS, {
		q: `select * from yahoo.finance.quotes where symbol in ("${symbols.join(',')}")`,
	});

	const query = buildQueryString(params);
	const url = `${YAHOO_BASE_URL}?${query}`;

	return url;
};


const buildQuandlUrl = (symbol, params) => {
	// https://www.quandl.com/api/v3/datasets/WIKI/
	const query = buildQueryString(Object.assign(params, { key: QUANDL_KEY }));

	return `${QUANDL_BASE_URL}/${symbol}?${query}`;
};

const buildQueryString = (params) => Object.keys(params)
	.filter(key => params[key] !== null)
	.map(key => `${key}=${encodeURIComponent(params[key])}`).join('&');

/**
 * Fetch quotes from alphavantage for symbol
 *
 * @param {Array} symbol The name of the equity
 */
const fetchQuotes = (symbols) => {
	symbols = Array.isArray(symbols) ? symbols : [symbols];

	const url = buildQuoteUrl(symbols);

	return fetch(url)
		.then((r) => {
			if (!r.ok) {
				return Promise.reject('Not OK');
			}

			return r;
		})
		.then(r => r.json())
		.then((r) => {
			let quotes = r.query.results.quote;
			quotes = Array.isArray(quotes) ? quotes : [quotes];

			const quotesObj = {};

			quotes.forEach((q) => {
				quotesObj[q.Symbol] = q;
			});

			return quotesObj;
		});
};

const fetchChartData = (symbol, collapse = 'monthly', startDate = null, endDate = null) => {
	const url = buildQuandlUrl(symbol, {
		collapse,
		start_date: startDate,
		end_date: endDate,
	});

	console.log(url);
	// fetch(url)
	// 	.then(r => r.json())
};

fetchChartData('AAPL', null, null, '1981-02-02');

export default {
	fetchQuotes,
	fetchChartData,
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
