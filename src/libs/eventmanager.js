class EventManager {
	constructor() {
		this.events = {};
		this.eventsAll = [];
	}
	subscribe(event, callback) {
		if (!this.events[event]) this.events[event] = [];
		this.events[event].push(callback);
	}
	publish(event, data) {
		this.eventsAll.forEach(callback => callback({event, data}));
		this.upstream && this.upstream.publish("EVENT_BUBBLE", { event, data });
		if (!this.events[event] || this.events[event].length < 1) return;
		this.events[event].forEach(callback => callback(data));
	}

	subscribeAll(callback) {
		this.eventsAll.push(callback);
	}

	subscribeBubble(event, callback) {
		let temp = (data) => {
			let depth = 0;
			while(data.event === "EVENT_BUBBLE") {
				depth++;
				data = data.data;
			}
			if(data.event === event) {
				callback({
					data: data.data,
					depth: depth
				});
			}
		}
		this.subscribeAll(temp);
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
	onceMulti(events, callback, condition) {
		let temp = data => {
			if (condition && !condition(data)) return;
			callback(data);
			events.forEach(event => this.unsubscribe(event, temp));
		};
		events.forEach(event => this.subscribe(event, temp));
	}
	async wait(event, condition) {
		return new Promise((resolve, reject) => {
			this.once(event, resolve, condition);
		});
	}
	setUpstreamEventManager(upstream) {
		this.upstream = upstream;
	}
	destroy() {
		this.events = {};
		this.eventsAll = [];
	}
}

export default EventManager;