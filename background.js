// background js (Manifest V3)

// Initial store state
let store = {
  isActive: true,
  isHideBalance: true,
  isShowProfile: true,
  isAutoRefresh: true,
};

// Use chrome.action for browserAction in MV3
chrome.action.setBadgeBackgroundColor({ color: '#e32f02' });

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get('store', (data) => {
    if (!data.store) {
      chrome.storage.local.set({ store });
    }
  });
});

// A map to store active intervals by tabId and platform
var timeinterval = {
  fiverr: {},
  upwork: {},
};

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.status === 'complete') {
    chrome.storage.local.get('store', (data) => {
      if (!data.store || !data.store.isAutoRefresh) {
        // If store is not set or auto-refresh is disabled, stop any existing timers and return
        backgroundTimerIntervalStop(tabId, 'fiverr');
        backgroundTimerIntervalStop(tabId, 'upwork');
        return;
      }

      const { isAutoRefresh } = data.store;

      if (
        tab.url &&
        tab.url.includes('www.fiverr.com') &&
        (tab.url.includes('seller_dashboard') ||
          tab.url.includes('public_mode=true'))
      ) {
        if (isAutoRefresh) {
          // Stop any existing Fiverr timer for this tab
          backgroundTimerIntervalStop(tabId, 'fiverr');
          // Start a new Fiverr timer
          backgroundTimeInterval(180, 180, tabId, 'fiverr');
        } else {
          backgroundTimerIntervalStop(tabId, 'fiverr');
        }
      } else if (
        tab.url &&
        tab.url.includes('www.upwork.com') &&
        tab.url.includes('most-recent')
      ) {
        if (isAutoRefresh) {
          // Stop any existing Upwork timer for this tab
          backgroundTimerIntervalStop(tabId, 'upwork');
          // Start a new Upwork timer
          backgroundTimeInterval(180, 180, tabId, 'upwork');
        } else {
          backgroundTimerIntervalStop(tabId, 'upwork');
        }
      } else {
        // If navigating away from monitored pages, stop relevant timers
        backgroundTimerIntervalStop(tabId, 'fiverr');
        backgroundTimerIntervalStop(tabId, 'upwork');
      }
    });
  }
});

// Function to refresh the tab using scripting API
async function refresh(tabId) {
  try {
    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: () => window.location.reload(),
    });
  } catch (error) {
    console.error(`Failed to refresh tab ${tabId}: ${error.message}`);
    // Potentially stop the timer if the tab is no longer accessible
    backgroundTimerIntervalStop(tabId, 'fiverr'); // Or 'upwork', depending on how you want to handle it
    backgroundTimerIntervalStop(tabId, 'upwork'); // Clear all for this tab
  }
}

function backgroundTimeInterval(timer, totalSec, tabId, platform) {
  // Clear any existing interval for this specific tab and platform before starting a new one
  if (timeinterval[platform][tabId]) {
    clearInterval(timeinterval[platform][tabId]);
  }

  var badge =
    ('0' + Math.floor(timer / 60)).slice(-2) +
    ':' +
    ('0' + (timer % 60)).slice(-2);

  // Use chrome.action for browserAction in MV3
  chrome.action.setBadgeText({
    tabId: tabId,
    text: badge,
  });

  // Start Interval
  timeinterval[platform][tabId] = setInterval(async function () {
    chrome.tabs.get(tabId, function (tab) {
      if (chrome.runtime.lastError || !tab) {
        console.log(`Tab ${tabId} no longer exists or error: ${chrome.runtime.lastError?.message || 'Tab not found'}`);
        backgroundTimerIntervalStop(tabId, platform);
        return false;
      } else {
        // Tab Exists
        timer--;
        if (timer < 0) {
          refresh(tabId);
          timer = totalSec;
        }
        var badge =
          ('0' + Math.floor(timer / 60)).slice(-2) +
          ':' +
          ('0' + (timer % 60)).slice(-2);
        chrome.action.setBadgeText({
          tabId: tabId,
          text: badge,
        });
      }
    });
  }, 1000);
}

// Stop Timer Interval
function backgroundTimerIntervalStop(tabId, platform) {
  if (platform && timeinterval[platform][tabId]) {
    clearInterval(timeinterval[platform][tabId]);
    delete timeinterval[platform][tabId]; // Remove the entry
  } else if (!platform) { // If no platform specified, stop all timers for the tab
    for (const p in timeinterval) {
      if (timeinterval[p][tabId]) {
        clearInterval(timeinterval[p][tabId]);
        delete timeinterval[p][tabId];
      }
    }
  }
  chrome.action.setBadgeText({
    tabId: tabId,
    text: '',
  });
}

// Optional: Clean up intervals when a tab is closed
chrome.tabs.onRemoved.addListener(function (tabId) {
  backgroundTimerIntervalStop(tabId, 'fiverr');
  backgroundTimerIntervalStop(tabId, 'upwork');
});

// Optional: Add an onSuspend event listener if you need to perform actions when the service worker is about to be terminated.
// However, for this use case, setInterval and chrome.tabs.get checks are usually sufficient.
/*
chrome.runtime.onSuspend.addListener(() => {
  console.log("Service Worker is suspending. Consider saving any transient state.");
});
*/