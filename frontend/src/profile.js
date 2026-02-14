import { getUser, registerUser } from "./util/bridge.js"

const user = await getUser()

var currentLoginElement = null

if(user) {
  startProfileFlow()
} else {
  startProfileLoginFlow()
}

function startProfileFlow() {
  
}

function startProfileLoginFlow() {
  const tpl = document.getElementById("login-form-template")
  const node = tpl.content.cloneNode(true)

  const loginMenuElement = node.querySelector('.profile-login-menu')

  loginMenuElement.querySelector('.register-button').addEventListener('click', register)

  document.body.appendChild(loginMenuElement)
  currentLoginElement = loginMenuElement
}

async function register() {
  console.log(currentLoginElement)
  const usernameInput = currentLoginElement.querySelector('#username-input')
  const username = usernameInput.value
  usernameInput.value = ''
  const passwordInput = currentLoginElement.querySelector('#password-input')
  const password = passwordInput.value
  passwordInput.value = ''

  await registerUser(username, password)
}