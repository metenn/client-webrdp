/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import "./style.css";
import questionmarkSvg from "./questionmark.svg";
import spinnerSvg from "./spinner.svg";
import "./sampleCounter";
// import SimplePeer from "simple-peer";

const wrdp = document.querySelector<HTMLDivElement>("[hx-component=\"webrdp\"]")!;

const wrdpBadgeColor = wrdp.querySelector("[color-badge]")!;
const wrdpBadge = wrdp.querySelector("[badge]")!;
const wrdpWindow = wrdp.querySelector("[window]")!;
const wrdpSpecialCode = wrdp.querySelector("[js-wrdp-connectcode]")!;
// Reveal Window
wrdpBadgeColor.addEventListener("click", async () => {
	wrdpBadge.classList.add("hidden");
	wrdpWindow.classList.remove("hidden");
	try {
		ws.close();
	}
	catch (error) {
		console.warn(error);
	}
	wrdpSpecialCode.textContent = await wsConn();
});

let ws: WebSocket;

async function startReceiving() {
	// get video/voice stream
	//@ts-ignore
	const peer2 = new SimplePeer();
	ws.onmessage = (e) => {
		peer2.signal(JSON.parse(e.data));
	};
	peer2.on("signal", (data) => {
		try {
			ws.send(JSON.stringify({
				action: "peermessage",
				data: JSON.stringify(data)
			})); // peer2.signal(data); // send ws message instead
		}
		catch (error) {
			console.error(error);
		}
	});

	peer2.on("stream", stream => {
		console.log("STREAM!");
		wrdpWindow.classList.add("hidden");
		// got remote video stream, now let's show it in a video tag
		const video = document.querySelector<HTMLVideoElement>("[wrdp-video]")!;

		if ("srcObject" in video) {
			video.srcObject = stream;
		}
		else {
			// @ts-ignore
			video.src = window.URL.createObjectURL(stream); // for older browsers
		}

		video.play();
	});
}

async function wsConn() {
	return new Promise((resolve, reject) => {
		ws = new WebSocket("wss://dcle6umqf3.execute-api.eu-north-1.amazonaws.com/Maciek");
		ws.onclose = (e) => {
			console.log("CLOSED");
		};
		ws.onerror = (e) => {
			console.error(e);
			ws.close();
		};
		ws.onopen = (e) => {
			ws.send(JSON.stringify({ action: "sendmessage", data: "GET_CODE" }));
			console.log("OPEN");
		};
		ws.onmessage = (e) => {
			if (e.data?.length === 4) {
				startReceiving();
				resolve(e.data);
			}
			else {
				reject();
			}
		};
	});
}