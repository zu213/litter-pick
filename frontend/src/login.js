import { fetchToken } from "./util/bridge.js"

var loginElement = null

export function startLoginFlow() {
  const tpl = document.getElementById("login-template")
  const node = tpl.content.cloneNode(true)

  const loginEl = node.querySelector('.login-mask')
  loginEl.addEventListener('click', (e) => dismissLogin(e))
  loginEl.querySelector('.login-menu').addEventListener('click', (e) => e.stopPropagation())

  const loginButtonEl = loginEl.querySelector('.login-menu-button')
  loginButtonEl.addEventListener('click', () => login())

  requestAnimationFrame(() => {
    loginEl.classList.add("is-open")
  })

  document.body.appendChild(loginEl)
  loginElement = loginEl
}

const dismissLogin = (e) => {
  e?.stopPropagation()
  if(!loginElement) return

  loginElement.classList.remove("is-open")

  loginElement.addEventListener(
    "transitionend",
    () => {
      document.body.removeChild(loginElement)
      loginElement = null
    },
    { once: true }
  )
}

const login = () => {
  const usernameElement = loginElement.querySelector('.login-menu-username--input')
  const passwordElement = loginElement.querySelector('.login-menu-password--input')

  if(!usernameElement.value || !passwordElement.value) return false

  return fetchToken(usernameElement.value, passwordElement.value).then(success => {
    if(success) {
      dismissLogin()
      document.dispatchEvent(
        new CustomEvent("auth:login-success")
      )
      return true
    } else {
      showLoginError()
      return false
    }
  }).catch(_ => false)

}

const showLoginError = () => {
  // loginElement
}