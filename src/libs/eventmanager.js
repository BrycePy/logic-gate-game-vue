class EventManager {
	constructor() {
		this.events = {};
	}
	subscribe(event, callback) {
		if (!this.events[event]) this.events[event] = [];
		this.events[event].push(callback);
	}
	publish(event, data) {
		if (!this.events[event] || this.events[event].length < 1) return;
		this.events[event].forEach(callback => callback(data));
	}
	unsubscribe(event, callback) {
		if (!this.events[event]) return;
		this.events[event] = this.events[event].filter(cb => cb !== callback);
	}
	once(event, callback, condition) {
		let temp = data => {
			if (condition && !condition(data)) return;
			callback(data);
			this.unsubscribe(event, temp);
		};
		this.subscribe(event, temp);
	}
	async wait(event, condition) {
		return new Promise((resolve, reject) => {
			this.once(event, resolve, condition);
		});
	}
}

export default EventManager;