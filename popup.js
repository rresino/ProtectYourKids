document.addEventListener('DOMContentLoaded', () => {
    const patternsTextarea = document.getElementById('blacklistPatterns');
    const saveButton = document.getElementById('savePatterns');
    const logsDiv = document.getElementById('logs');
    const clearLogsButton = document.getElementById('clearLogs');
  
    // Load saved patterns
    chrome.storage.local.get(['blacklistPatterns'], (result) => {
      patternsTextarea.value = (result.blacklistPatterns || []).join('\n');
    });
  
    // Load logs
    function loadLogs() {
      chrome.runtime.sendMessage({ type: 'GET_LOGS' }, (response) => {
        logsDiv.textContent = response.logs;
      });
    }
    loadLogs();
  
    // Save patterns
    saveButton.addEventListener('click', () => {
      const patterns = patternsTextarea.value
        .split('\n')
        .map(p => p.trim())
        .filter(p => p);
  
      chrome.runtime.sendMessage({
        type: 'UPDATE_BLACKLIST',
        patterns
      }, (response) => {
        if (response.success) {
          alert('Patterns saved successfully!');
        }
      });
    });
  
    // Clear logs
    clearLogsButton.addEventListener('click', () => {
      chrome.storage.local.set({ visitLog: '' }, () => {
        loadLogs();
      });
    });
  });