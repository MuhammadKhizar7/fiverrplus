let store = {
  isActive: true,
  isHideBalance: true,
  isShowProfile: true,
  isAutoRefresh: true,
}

chrome.browserAction.setBadgeBackgroundColor({ color: '#e32f02' })

chrome.runtime.onInstalled.addListener((details) => {
  chrome.storage.local.get('store', (data) => {
    if (!data.store) {
      chrome.storage.local.set({ store })
    }
  })
})

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.status == 'complete') {
    if (
      tab.url.split('/').includes('www.fiverr.com') &&
      tab.url.split('/').includes('seller_dashboard')
    ) {
      chrome.storage.local.get('store', (data) => {
        if (data.store.isAutoRefresh) {
          backgroundTimerIntervalStop(tabId)
          backgroundTimeInterval(180, 180, tabId)
        }
      })
    } else {
      backgroundTimerIntervalStop(tabId)
    }
  }
})

function refresh(tabId) {
  var code = () => window.location.reload()
  chrome.tabs.executeScript(tabId, {
    // target: { tabId, allFrames: true },
    // func: code,
    code: 'window.location.reload()',
  })
}

var timeinterval = 0

function backgroundTimeInterval(timer, totalSec, tabId) {
  var badge =
    ('0' + Math.floor(timer / 60)).slice(-2) +
    ':' +
    ('0' + (timer % 60)).slice(-2)
  chrome.browserAction.setBadgeText({
    tabId: tabId,
    text: badge,
  })
  // Start Interval
  timeinterval = setInterval(function () {
    chrome.tabs.get(tabId, function () {
      if (chrome.runtime.lastError) {
        console.log(chrome.runtime.lastError.message)
        backgroundTimerIntervalStop(tabId)
        return false
      } else {
        // Tab Exists
        timer--
        if (timer < 0) {
          refresh(tabId)
          timer = totalSec
        }
        var badge =
          ('0' + Math.floor(timer / 60)).slice(-2) +
          ':' +
          ('0' + (timer % 60)).slice(-2)
        chrome.browserAction.setBadgeText({
          tabId: tabId,
          text: badge,
        })
      }
    })
  }, 1000)
}

// Stop Timer Interval
function backgroundTimerIntervalStop(tabId) {
  clearInterval(timeinterval)
  chrome.browserAction.setBadgeText({
    tabId: tabId,
    text: '',
  })
}
