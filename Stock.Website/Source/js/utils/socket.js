// check if websockets are supported
const isSupported = 'WebSocket' in window;

// setup websocket URL
const { host } = window.location;
const socketProtocol = window.location.protocol === 'http:' ? 'ws' : 'wss';
const socketBaseUrl = `${socketProtocol}://${host}/ws`;

class Connection {
	constructor(url) {
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
	send(message) {
		const sendMessage = () => this.socket.send(JSON.stringify(message));

		if (this.isConnected) {
			sendMessage();

			return this;
		}

		this.waitForSocketConnection()
			.then(sendMessage)
			.catch(console.warn);

		return this;
	}

	waitForSocketConnection() {
		if (this.isClosing || this.isClosed) {
			return Promise.reject(new Error('Socket is not open.'));
		}

		return new Promise((resolve) => {
			const onSocketOpen = () => {
				this.socket.removeEventListener('open', onSocketOpen);
				resolve();
			};

			this.socket.addEventListener('open', onSocketOpen);
		});
	}

	updateState() {
		this.state.isConnected = this.isConnected;
		this.state.isReconnecting = this.isReconnecting;
	}

	onSocketOpen() {
		this.reconnectAttempts = 0;
		this.isReconnecting = false;
		this.updateState();
	}

	onSocketError() {
		this.updateState();
	}

	onSocketMessage() {
		//
	}

	get isConnecting() {
		return this.socket && this.socket.readyState === WebSocket.CONNECTING;
	}

	get isConnected() {
		return this.socket && this.socket.readyState === WebSocket.OPEN;
	}

	get isClosing() {
		return this.socket && this.socket.readyState === WebSocket.CLOSING;
	}

	get isClosed() {
		return !this.socket || this.socket.readyState === WebSocket.CLOSED;
	}
}

export default new Connection(socketBaseUrl);