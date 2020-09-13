let tabImgs = {};
let lastTabStatus = {};
let initializing = false;
const storageKey = "tabscollage_view";

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
	captureVisibleTab();
});

chrome.tabs.onActivated.addListener(captureVisibleTab);

function captureVisibleTab() {
	console.log(initializing);
	if (initializing) return;
	chrome.tabs.query({ currentWindow: true, active: true }, tabs => {
		const tab = tabs[0];
		if (!isValidTab(tab)) return;
		console.log('attempting to capture tab')
		chrome.tabs.captureVisibleTab(tab.windowId, dataUrl => {
			if (dataUrl) {
				tabImgs[tab.id] = dataUrl;
				console.log('captured')
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
			const tabIds = [];
			tabs.forEach(tab => {
				if (isValidTab(tab) && !tabImgs[tab.id]) tabIds.push(tab.id);
			})
			console.log(tabs);
			initCapture(tabIds);
		})
	} else if (msg === 'refresh') {
		sendData();
	} else if (msg.type === 'save_view') {
		console.log(`save_view, viewTreeJson: ${msg.data}`);
		localStorage.setItem(storageKey, msg.data);
	} else if (msg === 'get_view') {
		const viewTreeJson = localStorage.getItem(storageKey);
		console.log(`get_view, viewTreeJson: ${viewTreeJson}`);
		response(viewTreeJson ? viewTreeJson : 'undefined');
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
			type: 'data',
			data: {
				tabs,
				tabImgs: cleantabImgs
			}
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

function initCapture(tabIds) {
	if (tabIds.length === 0) {
		sendData();
		return;
	}
	let popupWindowId = null;
	chrome.windows.getCurrent(window => {
		const width = window.width * 0.2;
		const height = window.height * 0.2;
		const top = window.top + window.height / 2 - height / 2;
		const left = window.left + window.width / 2 - width / 2;
		const popupUrl = chrome.extension.getURL('popup.html');
		chrome.windows.create({
			url: popupUrl,
			type: 'popup',
			focused: true,
			width,
			height,
			top,
			left
		}, popupWindow => { popupWindowId = popupWindow.id });
	})
	initializing = true;
	openAllWindows(minWindows => {
		const openTab = i => {
			if (i >= tabIds.length) {
				initializing = false;
				minimizeWindows(minWindows);
				openExtension(() => { sendData() });
				// close progress window if exists
				if(popupWindowId) chrome.windows.remove(popupWindowId);
			} else {
				chrome.tabs.update(tabIds[i], { active: true }, tab => {
					chrome.tabs.captureVisibleTab(tab.windowId, dataUrl => {
						if (dataUrl) {
							tabImgs[tab.id] = dataUrl;
						}
						sendProgress(i + 1, tabIds.length);
						openTab(i + 1);
					})
				});
			}
		}
		openTab(0);
	})
}

function sendProgress(progress, numTasks) {
	chrome.runtime.sendMessage({
		type: 'progress',
		progress,
		numTasks
	})
}

function openAllWindows(callback) {
	chrome.windows.getAll({ windowTypes: ['normal'] }, windows => {
		const minWindows = windows.filter(window => {
			return window.state === "minimized";
		})
		if (minWindows.length === 0) {
			callback([]);
			return;
		}
		const openWindow = i => {
			if (i >= minWindows.length) {
				callback(minWindows);
				return;
			} else {
				chrome.windows.update(minWindows[i].id, { state: "maximized" }, () => {
					openWindow(i + 1);
				})
			}
		}
		openWindow(0);
	})
}

function minimizeWindows(windows) {
	for (let i = 0; i < windows.length; i++) {
		const id = windows[i].id;
		chrome.windows.update(id, { state: "minimized" });
	}
}