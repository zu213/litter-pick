import { startLoginFlow } from "./login.js"
import { joinArea, validateToken, getCurrentUser, getArea } from "./util/bridge.js"

var currentDetailedCardElement = null
var currentFeature = null

export async function startAreaCardFlow(feature) {

  const road = await getArea(feature.id)

  currentFeature = feature
  const tpl = document.getElementById("detailed-card-template")
  const node = tpl.content.cloneNode(true)

  const cardBase = node.querySelector('.detailed-card-mask')

  requestAnimationFrame(() => {
    cardBase.classList.add("is-open")
  })

  road['users'] = road['users'].map(user =>user.username)
  cardBase.querySelector('#area-volunteers').innerText = `Volunteers: ${road['users'].length > 0  ? road['users'].join() : 'No volunteers for area found'}`
  cardBase.querySelector('#area-title').innerText = `Area: ${feature['properties']['name'] ?? `Unnamed area`}`

  const button = document.createElement('button')
  button.className = 'detailed-card-button'
  validateToken().then(response => {
    if(response) {
      button.innerText = 'Volunteer'
      button.addEventListener('click', volunteer)
    } else {
      button.innerText = 'Login to Volunteer'
      button.addEventListener('click', loginFlow)
    }

    const card = cardBase.querySelector('.detailed-card')
    card.appendChild(button)
    card.addEventListener('click', (e) => e.stopPropagation())

    cardBase.addEventListener('click', () => removeCardElement())

    document.body.appendChild(cardBase)
    currentDetailedCardElement = cardBase
  })
}

function updateIfLoggedIn() {
  const volunteerButton = currentDetailedCardElement.querySelector('.detailed-card-button')
  volunteerButton.innerText = 'Volunteer'
  volunteerButton.removeEventListener('click', loginFlow)
  volunteerButton.addEventListener('click', volunteer)
  document.removeEventListener("auth:login-success", updateIfLoggedIn)
}

const loginFlow = () => {
  startLoginFlow()
  document.addEventListener("auth:login-success", () => updateIfLoggedIn())
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
      }
      if(response.error) {
        console.log(response.error_message)
      }
    }
  })
}

function updateVolunteers(users) {
  const usernames = users.map(users => users.username).join()
  currentDetailedCardElement.querySelector('#area-volunteers').innerText = `Volunteers: ${usernames ?? 'No volunteers for area found'}`
}