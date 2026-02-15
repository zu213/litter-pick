import { startLoginFlow } from "./login.js"
import { joinArea, validateToken, getArea, getCurrentUserId, leaveArea } from "./util/bridge.js"

var currentDetailedCardElement = null
var currentFeature = null
var currentUsersVolunteering = []

export async function startAreaCardFlow(feature) {

  document.addEventListener("auth:logout-success", updateCard)
  document.addEventListener("auth:login-success", updateCard)

  const road = await getArea(feature.id)
  currentUsersVolunteering = road['users']

  currentFeature = feature
  const tpl = document.getElementById("detailed-card-template")
  const node = tpl.content.cloneNode(true)

  const cardBase = node.querySelector('.detailed-card-mask')

  requestAnimationFrame(() => {
    cardBase.classList.add("is-open")
  })

  const usernames = currentUsersVolunteering.map(user =>user.username)
  cardBase.querySelector('#area-volunteers').innerText = `Volunteers: ${road['users'].length > 0  ? usernames.join() : 'No volunteers for area found'}`
  cardBase.querySelector('#area-title').innerText = `Area: ${feature['properties']['name'] ?? `Unnamed area`}`

  const button = document.createElement('button')
  button.className = 'detailed-card-button'
  validateToken().then(response => {
    if(response) {
      const userIds = currentUsersVolunteering.map(user =>user.id)
      if(userIds.includes(getCurrentUserId())){
        button.innerText = 'Unvolunteer'
        button.addEventListener('click', unvolunteer)
      } else {
        button.innerText = 'Volunteer'
        button.addEventListener('click', volunteer)
      }
    } else {
      button.innerText = 'Login to Volunteer'
      button.addEventListener('click', startLoginFlow)
    }

    const card = cardBase.querySelector('.detailed-card')
    card.appendChild(button)
    card.addEventListener('click', (e) => e.stopPropagation())

    cardBase.addEventListener('click', () => removeCardElement())

    document.body.appendChild(cardBase)
    currentDetailedCardElement = cardBase
  })
}

function updateCard() {
  const volunteerButton = currentDetailedCardElement.querySelector('.detailed-card-button')
  volunteerButton.removeEventListener('click', startLoginFlow)
  volunteerButton.removeEventListener('click', volunteer)
  volunteerButton.removeEventListener('click', unvolunteer)

  console.log(getCurrentUserId())
  if(currentUsersVolunteering.map(u => u.id).includes(getCurrentUserId())) {
    volunteerButton.innerText = 'Unvolunteer'
    volunteerButton.addEventListener('click', unvolunteer)
  } else {
    volunteerButton.innerText = 'Volunteer'
    volunteerButton.addEventListener('click', volunteer)
  }
}

function removeCardElement() {
  currentDetailedCardElement.classList.remove("is-open")

  currentDetailedCardElement.addEventListener(
    "transitionend",
    () => {
      if(currentDetailedCardElement) document.body.removeChild(currentDetailedCardElement)
      currentDetailedCardElement = null
    },
    { once: true }
  )
}

function volunteer() {
  // Don't need user id as backend can tell from token
  joinArea(currentFeature.id).then(response => {
    if(response) {
      if(response.users){
        updateVolunteers(response.users)
        updateCard()
      }
      if(response.error) {
        console.log(response.error_message)
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
        console.log(response.error_message)
      }
    }
  })
}

function updateVolunteers(users) {
  currentUsersVolunteering = users
  const usernames = users.map(users => users.username).join()
  currentDetailedCardElement.querySelector('#area-volunteers').innerText = `Volunteers: ${users.length < 1 ? 'No volunteers for area found' : usernames}`
}