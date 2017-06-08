
const definition = {
	name: 'chart',
	template: '#template-chart',

	props: {
		symbol: { default: null },
	},
	data() {
		return {
			isLoaded: false,
			isDisplayed: false,
		};
	},

	mounted() {
		console.log('m', this.isLoaded);

		this.isLoaded = true;
	},
};

export default definition;
