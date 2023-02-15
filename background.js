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
      tab.url.includes('www.fiverr.com') &&
      (tab.url.includes('seller_dashboard') ||
        tab.url.includes('public_mode=true'))
    ) {
      chrome.storage.local.get('store', (data) => {
        if (data.store.isAutoRefresh) {
          backgroundTimerIntervalStop(tabId, 'fiverr')
          backgroundTimeInterval(180, 180, tabId, 'fiverr')
        }
      })
    }
  }
})

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.status == 'complete') {
    if (
      tab.url.split('/').includes('www.upwork.com') &&
      tab.url.split('/').includes('most-recent')
    ) {
      chrome.storage.local.get('store', (data) => {
        if (data.store.isAutoRefresh) {
          backgroundTimerIntervalStop(tabId, 'upwork')
          backgroundTimeInterval(180, 180, tabId, 'upwork')
        }
      })
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

var timeinterval = {
  fiverr: 0,
  upwork: 0,
}

function backgroundTimeInterval(timer, totalSec, tabId, platform) {
  var badge =
    ('0' + Math.floor(timer / 60)).slice(-2) +
    ':' +
    ('0' + (timer % 60)).slice(-2)
  chrome.browserAction.setBadgeText({
    tabId: tabId,
    text: badge,
  })
  // Start Interval
  timeinterval[platform] = setInterval(function () {
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
function backgroundTimerIntervalStop(tabId, platform) {
  clearInterval(timeinterval[platform])
  chrome.browserAction.setBadgeText({
    tabId: tabId,
    text: '',
  })
}
