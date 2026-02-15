import { getCurrentUser, registerUser, unsetToken } from "./util/bridge.js"
import { login } from "./util/helper.js"

var user = await getCurrentUser()

var currentLoginElement = null
var currentProfileElement = null
profilePage()

function profilePage() {
  if(user) {
    startProfileFlow()
  } else {
    startProfileLoginFlow()
  }
}

// Profile stuff
function startProfileFlow() {
  const tpl = document.getElementById("profile-template")
  const node = tpl.content.cloneNode(true)
  const profileMenuElement = node.querySelector('.profile-menu')

  profileMenuElement.querySelector('.logout-button').addEventListener('click', logout)

  const usernameHolder = profileMenuElement.querySelector('.user-name')
  usernameHolder.innerText = `Username: ${user.username}`

  const roadDetailsHolder = profileMenuElement.querySelector('.user-areas')
  roadDetailsHolder.innerHTML = `Roads: ${processRoadsToNames(user.roads)}`

  document.body.appendChild(profileMenuElement)
  currentProfileElement = profileMenuElement
}

function processRoadsToNames(unprocessed) {
  return unprocessed.map(road => {
    const parsed = JSON.parse(road.details)
    return parsed['properties']['name'] ?? 'Unnamed area'
  })
}

async function logout() {
  user = null
  document.dispatchEvent(
    new CustomEvent("auth:logout-success")
  )
  unsetToken()
  document.body.removeChild(currentProfileElement)
  currentProfileElement = null
  profilePage()
}

// Login stuff
function startProfileLoginFlow() {
  const tpl = document.getElementById("login-form-template")
  const node = tpl.content.cloneNode(true)
  const loginMenuElement = node.querySelector('.profile-login-menu')

  loginMenuElement.querySelector('.register-button').addEventListener('click', register)
  loginMenuElement.querySelector('.login-button').addEventListener('click', processLogin)

  document.body.appendChild(loginMenuElement)
  currentLoginElement = loginMenuElement
}

async function processLogin() {
  const usernameInput = currentLoginElement.querySelector('#username-input')
  const username = usernameInput.value
  usernameInput.value = ''
  const passwordInput = currentLoginElement.querySelector('#password-input')
  const password = passwordInput.value
  passwordInput.value = ''

  await login(username, password, switchToProfile, () => {})
}

async function switchToProfile() {
  console.log('test', currentLoginElement)
  document.body.removeChild(currentLoginElement)
  currentLoginElement = null
  user = await getCurrentUser()
  profilePage()
}

async function register() {
  const usernameInput = currentLoginElement.querySelector('#username-input')
  const username = usernameInput.value
  usernameInput.value = ''
  const passwordInput = currentLoginElement.querySelector('#password-input')
  const password = passwordInput.value
  passwordInput.value = ''

  await registerUser(username, password)
}