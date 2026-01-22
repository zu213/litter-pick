import { startLoginFlow } from "./login.js"

var currentDetailedCardElement = null
var loggedIn = false

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
  if(loggedIn) {
    button.innerText = 'Volunteer'
    button.addEventListener('click', () => joinArea(feature))
  } else {
    button.innerText = 'Login to Volunteer'
    button.addEventListener('click', () => startLoginFlow())
  }

  const card = cardBase.querySelector('.detailed-card')
  card.appendChild(button)
  card.addEventListener('click', (e) => e.stopPropagation())

  cardBase.addEventListener('click', () => removeCardElement())

  document.body.appendChild(cardBase)

  currentDetailedCardElement = cardBase
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