import { startLoginFlow } from './login.js'
import { joinArea, validateToken, getArea, getCurrentUserId, leaveArea, markAsPicked} from '../util/bridge.js'

var currentDetailedCardElement = null
var currentFeature = null
var currentPickButton = null
var currentUsersVolunteering = []

export async function startAreaCardFlow(feature, cardElement) {

  document.addEventListener('auth:logout-success', updateCard)
  document.addEventListener('auth:login-success', updateCard)

  currentFeature = feature
  const tpl = document.getElementById('detailed-card-template')
  const node = tpl.content.cloneNode(true)
  const cardBase = node.querySelector('.detailed-card-mask')
  currentDetailedCardElement = cardBase

  const card = cardBase.querySelector('.detailed-card')
  card.addEventListener('click', (e) => e.stopPropagation())
  cardBase.addEventListener('click', () => removeCardElement())

  document.body.appendChild(cardBase)
  requestAnimationFrame(() => cardBase.classList.add('is-open'))

  const road = await getArea(feature.id)
  if(road.error) {
    alert(road.error)
    return
  }
  currentUsersVolunteering = road['users']

  const usernames = currentUsersVolunteering.map(user => `<span><a href="./user.html?user=${user.id}">${user.username}</a></span>`)
  cardBase.querySelector('#area-volunteers').innerHTML = `Volunteers: ${road['users'].length > 0 ? usernames.join() : 'No volunteers for area found'}`
  cardBase.querySelector('#area-title').innerText = `Area: ${feature['properties']['name'] ?? `Unnamed area`}`
  updateLastPicked(road['last_picked'])

  const mainButton = document.createElement('button')
  mainButton.className = 'detailed-card-button'
  const tokenResponse = await validateToken()
  if(!tokenResponse.error) {
    const userIds = currentUsersVolunteering.map(user => user.id)
    const currentUser = getCurrentUserId()
    if(currentUser?.error) {
      alert(currentUser.error)
      return
    }
    if(userIds.includes(currentUser)){
      mainButton.innerText = 'Unvolunteer'
      mainButton.addEventListener('click', unvolunteer)
    } else {
      mainButton.innerText = 'Volunteer'
      mainButton.addEventListener('click', volunteer)
    }
  } else {
    mainButton.innerText = 'Login to Volunteer'
    mainButton.addEventListener('click', startLoginFlow)
  }

  const buttonContainer = cardBase.querySelector('.button-container')
  buttonContainer.appendChild(mainButton)

  if(mainButton.innerText == 'Unvolunteer') addPickButton()

  cardBase.querySelector('.detailed-card-loading').style.display = 'none'
  cardBase.querySelector('.detailed-card-content').style.display = 'block'
}

function updateCard() {
  const volunteerButton = currentDetailedCardElement.querySelector('.detailed-card-button')
  volunteerButton.removeEventListener('click', startLoginFlow)
  volunteerButton.removeEventListener('click', volunteer)
  volunteerButton.removeEventListener('click', unvolunteer)

  const currentUser = getCurrentUserId()
  if(currentUser?.error) {
    alert(currentUser.error)
    return
  }
  if(currentUsersVolunteering.map(u => u.id).includes(currentUser)) {
    volunteerButton.innerText = 'Unvolunteer'
    volunteerButton.addEventListener('click', unvolunteer)
    addPickButton()
  } else {
    volunteerButton.innerText = 'Volunteer'
    volunteerButton.addEventListener('click', volunteer)
    removePickButton()
  }
}

function removeCardElement() {
  currentDetailedCardElement.classList.remove('is-open')

  currentDetailedCardElement.addEventListener('transitionend', () => {
      if(currentDetailedCardElement) document.body.removeChild(currentDetailedCardElement)
      currentDetailedCardElement = null
    },
    { once: true }
  )
}

function volunteer() {
  // Don't need user id as backend can tell from token
  joinArea(currentFeature.id).then(response => {
    if(!response.error) {
      if(response.users){
        updateVolunteers(response.users)
        updateCard()
      }
      if(response.error) {
        displayError(response.error_message)
      }
    }
  })
}

function unvolunteer() {
  // Don't need user id as backend can tell from token
  leaveArea(currentFeature.id).then(response => {
    if(response) {
      if(response.users){
        updateVolunteers(response.users)
        updateCard()
      }
      if(response.error) {
        displayError(response.error_message)
      }
    }
  })
}

function updateVolunteers(users) {
  currentUsersVolunteering = users
  const usernames = currentUsersVolunteering.map(user => `<span><a href="./user.html?user=${user.id}">${user.username}</a></span>`).join()
  currentDetailedCardElement.querySelector('#area-volunteers').innerHTML = `Volunteers: ${users.length < 1 ? 'No volunteers for area found' : usernames}`
}

function addPickButton() {
  if(!currentDetailedCardElement) return
  const buttonContainer = currentDetailedCardElement.querySelector('.button-container')
  buttonContainer.classList.add('grid2')

  const button = document.createElement('button')
  button.className = 'detailed-card-button'
  button.innerText = 'Mark as picked'
  button.addEventListener('click', pickRoad)

  buttonContainer.appendChild(button)
  currentPickButton = button
}

async function pickRoad() {
  const response = await markAsPicked(currentFeature.id)
  if(response?.error) {
    alert(response.error)
    return
  }

  updateLastPicked(response.last_picked)
}

function removePickButton() {
  if(!currentPickButton || !currentDetailedCardElement) return
  const buttonContainer = currentDetailedCardElement.querySelector('.button-container')
  buttonContainer.classList.remove('grid2')

  buttonContainer.removeChild(currentPickButton)
  currentPickButton = null
}

function updateLastPicked(time) {
  if(!currentDetailedCardElement) return
  const lastPickedDiv = currentDetailedCardElement.querySelector('#area-last-picked')

  lastPickedDiv.innerText = `Last picked: ${formatDate(time)}`
}

function formatDate(isoString) {
  if(!isoString) return 'Never'

  const date = new Date(isoString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `${year}-${month}-${day} ${hours}:${minutes}`
}

function displayError(errorMessage) {
  alert(`Error: ${errorMessage}`)
}