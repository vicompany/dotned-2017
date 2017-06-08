/* globals Promise: false, */

const BASE_URL = 'http://finance.google.com/finance/info';

const DEFAULT_EXCHANGE = 'NASDAQ';

const DEFAULT_PARAMS = {
	client: 'ig',
};

const MAP_TABLE = {
	id: 'id',
	t: 'symbol',
	e: 'exchange',
	l: 'lastPrice',
	l_cur: 'lastPriceCurrency',
	c: 'change',
	cp: 'changePercentage',
	lt_dts: 'lastTradeDateTime',
};

const buildUrl = (ticker) => {
	const params = Object.assign({}, DEFAULT_PARAMS, {
		q: `${ticker.exchange}:${ticker.symbol}`,
	});

	const query = Object.keys(params).map(key => `${key}=${encodeURIComponent(params[key])}`).join('&');
	const url = `${BASE_URL}?${query}`;

	return url;
};

const textToArray = (textResponse) => {
	// see http://finance.google.com/finance/info?client=ig&q=NASDAQ%3AAAPL,GOOG
	const text = textResponse.replace('//', '');

	return JSON.parse(text);
};

const mapQuotes = (quotes) => {
	const mapped = {};

	quotes.forEach((quoteObj) => {
		const m = {};
		const symbol = quoteObj.t;

		Object.keys(quoteObj)
			.filter((key) => Object.keys(MAP_TABLE).includes(key))
			.forEach((key) => {
				m[MAP_TABLE[key]] = quoteObj[key];
			});

		mapped[symbol] = m;
	});

	return mapped;
};


const fetchQuotes = (symbol) => {
	const url = buildUrl({
		exchange: DEFAULT_EXCHANGE,
		symbol,
	});

	return fetch(url)
		.then((response) => {
			if (!response.ok) {
				return Promise.reject('Not OK');
			}

			return response;
		})
		.then(response => response.text())
		.then(text => textToArray(text))
		.then(quotes => mapQuotes(quotes));
};

export default fetchQuotes;

/**
 * quandl
 * https://www.quandl.com/api/v3/datasets/WIKI/AAPL.json?start_date=1985-05-01&end_date=1997-07-01&order=asc&column_index=4&collapse=quarterly&transformation=rdiff
 */

/**
 * Google
 * http://www.jarloo.com/real-time-google-stock-api/
 * http://finance.google.com/finance/info?client=ig&q=NASDAQ%3AAAPL,GOOG
 * https://www.google.com/finance?q=AMS:HEIA
 */
