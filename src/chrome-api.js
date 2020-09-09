/*global chrome*/
import store from './redux/store';
import * as actions from './redux/actions';

export function init() {
  chrome.runtime.sendMessage('init_capture');
  chrome.runtime.onMessage.addListener(data => {
    store.dispatch(actions.refreshView(data));
  })
}

export function removeTabs(tabIds) {
  try {
    chrome.tabs.remove(tabIds);
  } catch (e) { }
}

export function setTabActive(tabId) {
  try {
    chrome.tabs.update(tabId, { active: true });
  } catch (e) { }
}