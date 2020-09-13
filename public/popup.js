/*global chrome*/
const el = document.getElementById('progress-bar');

chrome.runtime.onMessage.addListener(msg => {
  if(msg.type === 'progress') {
    const width = msg.progress/msg.numTasks*100;
    el.style.width = `${width}%`;
    el.innerHTML = Math.round(width) + "%";
  }
})