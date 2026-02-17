import { selectRoadFromId } from "./roads.js"
import { startAreaCardFlow } from "./detailedCard.js"

var selectedRoadCardElement = null
var sidebarElement = null

export async function startSidebarFlow(features) {
  const tpl = document.getElementById("sidebar-template")
  const node = tpl.content.cloneNode(true)

  const cardHolderElement = node.getElementById('area-cards')
  
  for(const feature of features) {
  
    const cardElement = document.createElement('div')
    cardElement.id = feature['id'] 
    cardElement.className = 'area-card'
    cardElement.addEventListener('click', () => {
      startAreaCardFlow(feature)
      selectRoadCard(cardElement)
      selectRoadFromId(feature['id'])
    })

    cardElement.innerHTML = `<div>Area: ${feature['properties']['name'] ?? `Unnamed area`}</div>`
    cardHolderElement.appendChild(cardElement)
  }

  document.body.appendChild(cardHolderElement)
  sidebarElement = cardHolderElement

  document.querySelector('.loading-spinner').classList.add('hidden')
  document.querySelector('.map-container').classList.add('solid')
}

export function selectRoadCard(roadCardElement) {
  selectedRoadCardElement?.classList.remove('selected')

  // format area cards
  const areaCardElement = document.getElementById('area-cards')
  areaCardElement.classList.add('visible')
  roadCardElement.scrollIntoView()
  roadCardElement.classList.add('selected')
  selectedRoadCardElement = roadCardElement
}

