chrome.action.onClicked.addListener((tab) => {
  const supportedHosts = [
    'app.slack.com',
    'chatgpt.com',
    'claude.ai',
    'gemini.google.com'
  ];
  const isSupported = tab.url && supportedHosts.some(host => tab.url.includes(host));
  if (isSupported) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    });
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'capture_visible_tab') {
    chrome.tabs.captureVisibleTab(sender.tab.windowId, { format: 'png' }, (dataUrl) => {
      sendResponse({ dataUrl: dataUrl });
    });
    return true;
  }
});
