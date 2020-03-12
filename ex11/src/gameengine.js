
export default class GameEngine {
    constructor() {
        this.handlers = {};

        window.addEventListener("message", this.handleMessage.bind(this));
    }

    on(messageType, callback) {
        if (!this.handlers[messageType]) {
            this.handlers[messageType] = [callback];
        } else {
            this.handlers[messageType].push(callback);
        }
    }
    
    off(messageType, callback) {
        const list = this.handlers[messageType];
        if (list) {
            const index = list.indexOf(callback);
            if (index >= 0) {
                list.splice(index, 1);
            }
        }
    }

    dispatch(messageType, context) {
        window.postMessage({ type: messageType, context: context })
    }

    handleMessage(e) {
        const message = e.data;
        const handlersWithType = this.handlers[message.type];
        if (handlersWithType) {
            const safeArray = handlersWithType.map(v=>v);
            safeArray.forEach(a => a(message.context));
        }
    }

    // action 목록을 어떻게 해야할까?
    notify(text) {
        this.dispatch("notify", text);
    }

    click() {
        this.dispatch("click");
    }
}