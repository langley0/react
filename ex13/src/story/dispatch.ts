const handlers: {[key:string]: any[] } = {};
function  handleMessage(e: MessageEvent) {
    const message = e.data;
    const handlersWithType = handlers[message.type];
    if (handlersWithType) {
        const safeArray = handlersWithType.map(v=>v);
        safeArray.forEach(a => a(message.context));
    }
}
window.addEventListener("message", handleMessage);
    
    

export function on(messageType: string, callback: Function) {
    if (!handlers[messageType]) {
        handlers[messageType] = [callback];
    } else {
        handlers[messageType].push(callback);
    }
}
    
export function off(messageType: string, callback: Function) {
    const list = handlers[messageType];
    if (list) {
        const index = list.indexOf(callback);
        if (index >= 0) {
            list.splice(index, 1);
        }
    }
}

 export function dispatch(messageType: string, context?: any) {
    window.postMessage({ type: messageType, context: context }, window.location.href);
}