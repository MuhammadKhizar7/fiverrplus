let all = document.getElementsByTagName('input')
let store = null

chrome.storage.local.get('store', (data) => {
  if (data.store) {
    store = data.store
    disabledAll(data.store.isActive)
    Array.from(all).forEach((item) => {
      item.checked = data.store[item.name]
    })
  }
})

function disabledAll(isDisabled) {
  const list = document.getElementsByClassName('input')
  for (let item of list) {
    item.disabled = !isDisabled
  }
}
Array.from(all).forEach(function (element) {
  element.addEventListener('change', onChange)
})
function onChange(e) {
  chrome.storage.local.set(
    { store: { ...store, [e.target.name]: e.target.checked } },
    (data) => {
      if (e.target.id === 'activate') {
        disabledAll(e.target.checked)
      }
    }
  )
}
