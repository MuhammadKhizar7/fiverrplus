let store = {
  isActive: true,
  isHideBalance: true,
  isShowProfile: true,
  isAutoRefresh: true,
  isDarkMode: false,
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
  if (changeInfo.status === 'loading') {
    chrome.storage.local.get('store', (data) => {
      if (data.store.isDarkMode) {
        chrome.tabs.executeScript(tabId, {
          // target: { tabId, allFrames: true },
          // func: code,
          code: "document.documentElement.classList.add('darkmode')",
        })
      }
    })
  }
  if (changeInfo.status == 'complete') {
    // chrome.storage.local.get('store', (data) => {
    //   if (data.store.isDarkMode) {
    //     chrome.tabs.executeScript(tabId, {
    //       // target: { tabId, allFrames: true },
    //       // func: code,
    //       code: "document.documentElement.classList.add('darkmode')",
    //     })
    //   }
    // })
    if (
      tab.url.split('/').includes('www.fiverr.com') &&
      tab.url.split('/')[5] == 'requests'
    ) {
      chrome.storage.local.get('store', (data) => {
        if (data.store.isAutoRefresh) {
          backgroundTimerIntervalStop(tabId)
          backgroundTimeInterval(180, 180, tabId)
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

// let lifeline

// keepAlive()

// chrome.runtime.onConnect.addListener((port) => {
//   if (port.name === 'keepAlive') {
//     lifeline = port
//     setTimeout(keepAliveForced, 295e3) // 5 minutes minus 5 seconds
//     port.onDisconnect.addListener(keepAliveForced)
//   }
// })

// function keepAliveForced() {
//   lifeline?.disconnect()
//   lifeline = null
//   keepAlive()
// }

// async function keepAlive() {
//   if (lifeline) return
//   for (const tab of await chrome.tabs.query({ url: '*://*/*' })) {
//     try {
//       await chrome.scripting.executeScript({
//         target: { tabId: tab.id },
//         function: () => chrome.runtime.connect({ name: 'keepAlive' }),
//         // `function` will become `func` in Chrome 93+
//       })
//       chrome.tabs.onUpdated.removeListener(retryOnTabUpdate)
//       return
//     } catch (e) {}
//   }
//   chrome.tabs.onUpdated.addListener(retryOnTabUpdate)
// }

// async function retryOnTabUpdate(tabId, info, tab) {
//   if (info.url && /^(file|https?):/.test(info.url)) {
//     keepAlive()
//   }
// }
