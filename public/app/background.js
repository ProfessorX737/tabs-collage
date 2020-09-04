let urls = {};
let tabs = {};
let urlImgs = {};

// Called when the user clicks on the browser action
chrome.browserAction.onClicked.addListener(function (tab) {
	const url = chrome.extension.getURL('index.html');
	if (urls[url]) {
		chrome.tabs.update(urls[url], { active: true });
	} else {
		chrome.tabs.create({ url });
	}
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
	const url = tab.url === "" ? tab.pendingUrl : tab.url;
	urls[url] = tabId;
	tabs[tabId] = url;
	if (tab.status === "complete") {
		captureVisibleTab();
	}
});

chrome.tabs.onActivated.addListener(activeInfo => {
	captureVisibleTab();
})

const captureVisibleTab = () => {
	chrome.tabs.query({ currentWindow: true, active: true}, tabs => {
		const tab = tabs[0];
		if(!tab) return;
		const url = tab.url !== "" ? tab.url : tab.pendingUrl;
		if(url === "") return;
		chrome.tabs.captureVisibleTab(imgSrc => {
			if (imgSrc) {
				// console.log(JSON.stringify(urlImgs))
				localStorage.setItem(url, imgSrc);
				urlImgs[url] = imgSrc;
			}
		})
	})
}

chrome.tabs.onRemoved.addListener(tabId => {
	const url = tabs[tabId];
	delete tabs[tabId];
	delete urls[url];
});

chrome.runtime.onMessage.addListener((msg, sender, response) => {
	response(urlImgs);
})