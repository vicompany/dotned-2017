import socketConnection from '../utils/socket';
import ticker from './ticker';

const definition = {
	name: 'ticker-overview',

	components: {
		ticker,
	},

	data() {
		return {
			selectedSymbol: null,
			symbols: ['Heineken', 'Yahoo', 'VI Company', 'Apple'],
			tickers: [],

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

		onSocketMessage(message) {
			const data = JSON.parse(message.data);

			this.$set(this.quotes, data.fund, data);
		},

		subscribe() {
			this.tickerSymbols.forEach((s) => {
				socketConnection.send(s);
			});
		},

	},
};

export default definition;
