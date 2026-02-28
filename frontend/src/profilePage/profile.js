import { getCurrentUser, registerUser, unsetToken } from '../util/bridge.js'
import { login } from '../util/helper.js'

var user = await getCurrentUser()
if(user.error) {
  alert(user.error)
} 
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
  const tpl = document.getElementById('profile-template')
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
  if(!Array.isArray(unprocessed) || unprocessed.length < 1) return 'None'

  return unprocessed.map(road => {
    const parsedDetails = JSON.parse(road.details)
    return `<span><a href="/frontend/public/index.html?road=${road['id']}">${parsedDetails['properties']['name'] ?? 'Unnamed area'}</a></span>`
  })
}

async function logout() {
  user = null
  document.dispatchEvent(new CustomEvent('auth:logout-success'))
  unsetToken()
  document.body.removeChild(currentProfileElement)
  currentProfileElement = null
  profilePage()
}

// Login stuff
function startProfileLoginFlow() {
  const tpl = document.getElementById('login-form-template')
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

  await login(username, password, switchToProfile, (e) => {alert(e)})
}

async function switchToProfile() {
  document.body.removeChild(currentLoginElement)
  currentLoginElement = null
  user = await getCurrentUser()
  if(user.error) {
    alert(user.error)
    return
  }
  profilePage()
}

async function register() {
  const usernameInput = currentLoginElement.querySelector('#username-input')
  const username = usernameInput.value
  usernameInput.value = ''
  const passwordInput = currentLoginElement.querySelector('#password-input')
  const password = passwordInput.value
  passwordInput.value = ''

  const res = await registerUser(username, password)
  if(res.error) {
    res.error_message ? alert(res.error_message) : alert(res.error)
  }
}