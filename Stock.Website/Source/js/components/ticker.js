const NA = '-';

const QUOTE_DEFAULT = {
	bid: null,
	ask: null,
	fund: '',
};

const definition = {
	template: '#template-ticker',
	name: 'ticker',

	components: {
		//
	},

	props: {
		index: {
			default: () =>0,
		},

		symbol: {
			default: () => null,
		},

		quote: {
			default: () => [],
		},
	},

	data() {
		return {
			isPositiveTick: false,
			isNegativeTick: false,
		};
	},

	computed: {
		bid() {
			if (!this.quote.bid) {
				return null;
			}

			return parseFloat(this.quote.bid);
		},

		ask() {
			if (!this.quote.ask) {
				return null;
			}

			return parseFloat(this.quote.ask);
		},

		mid() {
			if (!this.bid || !this.ask) {
				return '-';
			}

			return ((this.bid + this.ask) * 0.5).toPrecision(6);
		},
	},

	watch: {
		mid(newVal, oldVal) {
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
		},
	},

	beforeDestroy() {
		clearTimeout(this.quoteTimeoutId);
	},

	methods: {
		resetTickStates() {
			this.isPositiveTick = false;
			this.isNegativeTick = false;
		},

		remove() {
			this.$emit('remove', this.index);
		},
	},

	filters: {
		formatNumber(num) {
			if (!num) {
				return NA;
			}

			const locale = 'EN-en';
			const precision = 2;

			num = parseFloat(num);

			return num.toLocaleString(locale, {
				minimumFractionDigits: precision,
				maximumFractionDigits: precision,
			});
		},
	},
};

export default definition;
