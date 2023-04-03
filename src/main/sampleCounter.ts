export {}

const counters = document.querySelectorAll("[js-counter]");
for(let i = 0, countersLength = counters.length; i < countersLength; i++) {
	const counter = counters[i];
	const val = counter.querySelector("[counter-value]")!;
	const button = counter.querySelector("[counter-button]")!;
	button.addEventListener("click", () => {
		val.textContent = String(parseInt(val.textContent!) + 1);
	});
}