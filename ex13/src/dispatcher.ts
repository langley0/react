export default class GameEngine {
    private handlers: {[key: string]: Function[] };
    constructor() {
        this.handlers = {};

        window.addEventListener("message", this.handleMessage.bind(this));
    }

    on(messageType: string, callback: Function) {
        if (!this.handlers[messageType]) {
            this.handlers[messageType] = [callback];
        } else {
            this.handlers[messageType].push(callback);
        }
    }
    
    off(messageType: string, callback: Function) {
        const list = this.handlers[messageType];
        if (list) {
            const index = list.indexOf(callback);
            if (index >= 0) {
                list.splice(index, 1);
            }
        }
    }

    dispatch(messageType: string, context?: any) {
        window.postMessage({ type: messageType, context: context }, window.location.href);
    }

    handleMessage(e: MessageEvent) {
        const message = e.data;
        const handlersWithType = this.handlers[message.type];
        if (handlersWithType) {
            const safeArray = handlersWithType.map(v=>v);
            safeArray.forEach(a => a(message.context));
        }
    }

    // action 목록을 어떻게 해야할까?
    notify(text: string) {
        this.dispatch("notify", text);
    }

    click() {
        this.dispatch("click");
    }
}