import { startLoginFlow } from "./login.js"
import { validateToken } from "./util/bridge.js"

var currentDetailedCardElement = null

export function startAreaCardFlow(feature) {

  const tpl = document.getElementById("detailed-card-template")
  const node = tpl.content.cloneNode(true)

  const cardBase = node.querySelector('.detailed-card-mask')

  requestAnimationFrame(() => {
    cardBase.classList.add("is-open")
  })

  cardBase.querySelector('#area-volunteers').innerText = `Volunteers: ${feature['volunteers'] ?? 'No volunteers for area found'}`
  cardBase.querySelector('#area-title').innerText = `Area: ${feature['properties']['name'] ?? `Unnamed area`}`

  const button = document.createElement('button')
  button.className = 'detailed-card-button'
  validateToken().then(loggedIn => {
    if(loggedIn) {
      button.innerText = 'Volunteer'
      button.addEventListener('click', () => joinArea(feature))
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
  volunteerButton.addEventListener('click', () => joinArea(feature))
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