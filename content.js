chrome.storage.local.get('store', (data) => {
  if (data.store.isActive && data.store.isHideBalance) {
    document.getElementsByClassName('user-balance')[0].style.display = 'none'
  } else {
    document.getElementsByClassName('user-balance')[0].style.display = 'block'
  }
})

