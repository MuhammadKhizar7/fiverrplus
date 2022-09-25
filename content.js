chrome.storage.local.get('store', (data) => {
  if (
    data.store.isActive &&
    data.store.isHideBalance &&
    document.getElementsByClassName('user-balance')[0]
  ) {
    document.getElementsByClassName('user-balance')[0].style.display = 'none'
  } else if (document.getElementsByClassName('user-balance')[0]) {
    document.getElementsByClassName('user-balance')[0].style.display = 'block'
  }
  if (
    data.store.isActive &&
    data.store.isShowProfile &&
    window.location.pathname.split('/')[3] == 'requests'
  ) {
    loadData()

    let inv = setInterval(() => {
      if (document.querySelector('.db-load-more a')) {
        document
          .querySelector('.db-load-more a')
          .addEventListener('click', loadData)
        clearInterval(inv)
      }
      if (document.querySelector('.db-new-filters .tabs li a')) {
        document
          .querySelector('.db-new-filters .tabs li a ')
          .addEventListener('click', loadData)
        clearInterval(inv)
      }
    }, 500)
  }
})

let interval = null
function setUserName() {
  Array.from(
    document.querySelectorAll('.db-requests .db-new-main-table tbody tr')
  ).forEach((x) => {
    if (
      x.querySelector('.js-send-offer') &&
      !x.querySelector('.user-profile-link')
    ) {
      console.log('setUserName')
      let meta = x.querySelector('.js-send-offer').getAttribute('data-meta')
      let userJson = JSON.parse(meta)
      let username = userJson['username']
      let url = 'https://www.fiverr.com/' + username
      let a = `<a href=${url} class="user-profile-link" style="display:block; text-align:left" target="_blank">${username}</a>`
      let div = (document.createElement('div').innerHTML = a)
      if (x.querySelector('td.see-more')) {
        x.querySelector('td.see-more').insertAdjacentHTML('afterbegin', div)
      } else {
        x.querySelector('td.text-wide').insertAdjacentHTML('afterbegin', div)
      }
    }
    clearInterval(interval)
  })
}
function loadData() {
  console.log('loadData')
  interval = setInterval(setUserName, 500)
}

function getBgImgs(doc) {
  const srcChecker = /url\(\s*?['"]?\s*?(\S+?)\s*?["']?\s*?\)/i
  return Array.from(
    Array.from(doc.querySelectorAll('*')).reduce((collection, node) => {
      let prop = window
        .getComputedStyle(node, null)
        .getPropertyValue('background-image')
      // match `url(...)`
      let match = srcChecker.exec(prop)
      if (match) {
        collection.add(match[1])
      }
      return collection
    }, new Set())
  )
}
