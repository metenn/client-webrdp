import "./support-style.css";
// import SimplePeer from "simple-peer";

let ws: WebSocket;

async function wsConn(code: string) {
	return new Promise((resolve, reject) => {
		ws = new WebSocket("ws://" + "localhost:8080" + "/wrdp-consultant?code=" + encodeURIComponent(code));
		ws.onclose = (e) => {
			console.log("CLOSED");
			reject();
		};
		ws.onerror = (e) => {
			console.error(e);
			ws.close();
		};
		ws.onopen = (e) => {
			console.log("OPEN");
		};
		ws.addEventListener("message", (e) => {
			if (e.data === "OK") {
				resolve(null);
			}
			console.log(e.data);
		});
	});
}

async function startRecording() {
	// get video/voice stream
	const stream = await navigator.mediaDevices.getDisplayMedia({
		video: true,
		audio: false
	});
	// @ts-ignore
	const peer1 = new SimplePeer({ initiator: true, stream: stream });

	ws.onmessage = (e) => {
		try {
			peer1.signal(JSON.parse(e.data));
		}
		catch (error) {
			console.error(error);
		}
	};

	peer1.on("signal", (data) => {
		try {
			ws.send(JSON.stringify(data)); // peer2.signal(data); // send ws message instead
		}
		catch (error) {
			console.error(error);
		}
	});
}

const form = document.querySelector<HTMLInputElement>("#form")!;
const codeInput = document.querySelector<HTMLInputElement>("#code-input")!;
form.addEventListener("submit", (e) => {
	e.preventDefault();
	wsConn(codeInput.value).then(() => {
		startRecording();
	});
	return false;
});