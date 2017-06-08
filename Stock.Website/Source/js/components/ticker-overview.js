import socketConnection from '../utils/socket';
import ticker from './ticker';

socketConnection.send('heineken');

const definition = {
	name: 'ticker-overview',

	components: {
		ticker,
	},

	data() {
		return {
			refreshInterval: 2000, // MS
			selectedSymbol: null,
			symbols: 'AAL, AAPL, ADBE, ADI, ADP, ADSK, AKAM, ALXN, AMAT, AMGN, AMZN, ATVI, AVGO, BIDU, BIIB, BMRN, CA, CELG, CERN, CHKP, CHTR, CTRP, CTAS, CSCO, CTXS, CMCSA, COST, CSX, CTSH, DISCA, DISCK, DISH, DLTR, EA, EBAY, ESRX, EXPE, FAST, FB, FISV, FOX, FOXA, GILD, GOOG, HAS, HSIC, HOLX, ILMN, INCY, INTC, INTU, ISRG, JD, KLAC, KHC, LBTYA, LILA, LILAK, LRCX, QVCA, LVNTA, MAR, MCHP, MDLZ, MNST, MSFT, MU, MXIM, MYL, NCLH, NFLX, NVDA, ORLY, PAYX, PCAR, PCLN, QCOM, REGN, ROST, SBAC, STX, SHPG, SIRI, SWKS, SYMC, TMUS, TRIP, TSCO, TSLA, TXN, ULTA, VIAB, VOD, VRSK, VRTX, WBA, WDC, XLNX, XRAY, YHOO'.split(', '),
			tickers: [
				{ symbol: 'AAPL', isExpanded: false },
			],

			quotes: { },
		};
	},

	computed: {
		tickerSymbols() {
			return this.tickers.map(ticker => ticker.symbol);
		},
	},

	watch: {
		tickers() {
			this.subscribe();
		},
	},

	mounted() {
		socketConnection.socket.addEventListener('message', this.onSocketMessage);
		this.subscribe();
	},

	methods: {
		tickerExists(symbol) {
			return this.tickers.filter(t => t.symbol === symbol).length !== 0;
		},

		onTickerSelected() {
			this.addTicker(this.selectedSymbol);
			this.selectedSymbol = null;
		},

		onSocketMessage(message) {
			console.log(message);
		},

		addTicker(symbol, isExpanded = false) {
			this.tickers.push({
				symbol,
				isExpanded,
			});
		},

		remove(index) {
			this.tickers.splice(index, 1);
		},

		toggleExpanded(index) {
			this.tickers[index].isExpanded = !this.tickers[index].isExpanded;
		},

		subscribe() {
			// this.fetchQuote();
		},

	},
};

export default definition;
