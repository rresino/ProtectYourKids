let blacklistPatterns = [];

// Load saved patterns when extension starts
chrome.storage.local.get(['blacklistPatterns'], (result) => {
  blacklistPatterns = result.blacklistPatterns || [];
});

// Listen for URL changes
chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  // Only process main frame navigation
  if (details.frameId === 0) {
    const url = details.url;
    const timestamp = new Date().toISOString();
    
    // Log the visit
    logVisit(url, timestamp);
    
    // Check if URL matches any blacklist pattern
    if (isUrlBlocked(url)) {
      // Cancel the navigation
      chrome.tabs.update(details.tabId, {
        url: 'blocked.html'
      });
    }
  }
});

function isUrlBlocked(url) {
  return blacklistPatterns.some(pattern => {
    try {
      const regex = new RegExp(pattern);
      return regex.test(url);
    } catch (e) {
      console.error('Invalid regex pattern:', pattern);
      return false;
    }
  });
}

async function logVisit(url, timestamp) {
  const logEntry = `${timestamp} - ${url}\n`;
  
  // Using chrome.storage.local to store logs
  try {
    const result = await chrome.storage.local.get(['visitLog']);
    const currentLog = result.visitLog || '';
    await chrome.storage.local.set({
      visitLog: currentLog + logEntry
    });
  } catch (error) {
    console.error('Error logging visit:', error);
  }
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'UPDATE_BLACKLIST') {
    blacklistPatterns = request.patterns;
    chrome.storage.local.set({ blacklistPatterns });
    sendResponse({ success: true });
  } else if (request.type === 'GET_LOGS') {
    chrome.storage.local.get(['visitLog'], (result) => {
      sendResponse({ logs: result.visitLog || '' });
    });
    return true; // Required for async response
  }
});