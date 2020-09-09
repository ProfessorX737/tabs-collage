let tabImgs = {};
let lastTabStatus = {};
let initializing = false;

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
	captureVisibleTab();
});

chrome.tabs.onActivated.addListener(captureVisibleTab);

function captureVisibleTab() {
	if(initializing) return;
	chrome.tabs.query({ currentWindow: true, active: true }, tabs => {
		const tab = tabs[0];
		if (!isValidTab(tab)) return;
		console.log('attempting to capture tab')
		chrome.tabs.captureVisibleTab(dataUrl => {
			if (dataUrl) {
				tabImgs[tab.id] = dataUrl;
				sendData();
			}
		})
	})
}

function isValidTab(tab) {
	if (!tab) return false;
	const prevStatus = lastTabStatus[tab.id];
	lastTabStatus[tab.id] = tab.status;
	// if url starts with http and is either first time loading or complete
	// it is valid so return true;
	if ((tab.url?.match(/^https?:\/\//) || tab.pendingUrl?.match(/^https?:\/\//)
		&& (!prevStatus || prevStatus === "complete"))) {
		return true;
	}
	return false;
}

// Called when the user clicks on the browser action
chrome.browserAction.onClicked.addListener(function (tab) {
	openExtension();
});

chrome.tabs.onRemoved.addListener(tabId => {
	delete tabImgs[tabId];
	sendData();
});

chrome.runtime.onMessage.addListener((msg, sender, response) => {
	if (msg === 'init_capture') {
		// chrome.tabs.onActivated.removeListener(captureVisibleTab);
		chrome.tabs.query({}, tabs => {
			// screenshot all tabs made before extension was installed
			const newTabs = [];
			tabs.map(tab => {
				if (isValidTab(tab) && !tabImgs[tab.id]) newTabs.push(tab);
			})
			initCapture(newTabs);
		})
	} else if (msg === 'refresh') {
		sendData();
	}
})

const sendData = () => {
	chrome.tabs.query({}, tabs => {
		let cleantabImgs = {};
		for (let i = 0; i < tabs.length; i++) {
			const tab = tabs[i];
			if (tabImgs[tab.id]) {
				cleantabImgs[tab.id] = tabImgs[tab.id];
			}
		}
		chrome.runtime.sendMessage({
			tabs,
			tabImgs: cleantabImgs
		})
	})
}

function openExtension(callback = tab => { }) {
	const extensionUrl = chrome.extension.getURL('index.html');
	chrome.tabs.query({}, tabs => {
		for (let i = 0; i < tabs.length; i++) {
			const tab = tabs[i];
			const url = tab.url ? tab.url : tab.pendingUrl;
			if (url === extensionUrl) {
				if (!tab.active) {
					chrome.tabs.update(tab.id, { active: true });
				}
				callback(tab);
				return;
			}
		}
		chrome.tabs.create({ url: extensionUrl, active: true }, newTab => {
			callback(newTab)
		});
	})
}

function initCapture(tabs) {
	initializing = true;
	if (tabs.length === 0) {
		sendData();
		return;
	}
	let index = 0;
	const tabIds = tabs.map(tab => {
		if (tab.status === "complete") return tab.id;
	})
	const initActivatedListener = activeInfo => {
		chrome.tabs.captureVisibleTab(activeInfo.windowId, dataUrl => {
			if (dataUrl) {
				console.log('captured img');
				chrome.tabs.get(activeInfo.tabId, tab => {
					tabImgs[tab.id] = dataUrl;
				})
			}
			index += 1;
			if (index === tabIds.length) {
				console.log(`${Object.keys(tabImgs).length}/${tabIds.length}`)
				chrome.tabs.onActivated.removeListener(initActivatedListener);
				// chrome.tabs.onActivated.addListener(captureVisibleTab);
				openExtension(() => { sendData() });
				initializing = false;
			} else {
				if (tabIds[index]) {
					chrome.tabs.update(tabIds[index], { active: true });
				}
			}
		})
	}
	chrome.tabs.onActivated.addListener(initActivatedListener);
	chrome.tabs.update(tabIds[0], { active: true });
}