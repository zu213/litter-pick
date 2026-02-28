import { login } from "../util/helper.js"

var loginElement = null

export function startLoginFlow() {
  const tpl = document.getElementById("login-template")
  const node = tpl.content.cloneNode(true)

  const loginEl = node.querySelector('.login-mask')
  loginEl.addEventListener('click', dismissLogin)
  loginEl.querySelector('.login-menu').addEventListener('click', (e) => e.stopPropagation())

  const loginButtonEl = loginEl.querySelector('.login-menu-button')
  loginButtonEl.addEventListener('click', processLogin)

  requestAnimationFrame(() => loginEl.classList.add("is-open"))

  document.body.appendChild(loginEl)
  loginElement = loginEl
}

const dismissLogin = (e) => {
  e?.stopPropagation()
  if(!loginElement) return

  loginElement.classList.remove("is-open")

  loginElement.addEventListener("transitionend", () => {
      document.body.removeChild(loginElement)
      loginElement = null
    },
    { once: true }
  )
}

const processLogin = () => {
  const usernameElement = loginElement.querySelector('.login-menu-username--input')
  const passwordElement = loginElement.querySelector('.login-menu-password--input')
  return login(usernameElement.value, passwordElement.value, dismissLogin, showLoginError)
}

function showLoginError(errorMessage) {
  alert(`Error: ${errorMessage}`)
}