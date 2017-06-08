/* globals Vue: false, */
import tickerOverview from './components/ticker-overview';


const instance = new Vue({
	el: '.js-instance',
	name: 'root-instance',

	components: {
		tickerOverview,
	},
});

window.instance = instance;
