// 기초적인 명령을 받아서 실행하는 클라이언트 코드를 반환한다
export default function () {
    async function evaluate(code) {
        try {
            // eslint-disable-next-line no-eval
            eval(code);
        } catch(e) {

        }
    }
    
    function handleMessage(event) {
        const message = event.data;
        if (message.type === "execute") {
            evaluate(message.code);
        }
    }

    window.addEventListener("message", handleMessage, false);
}