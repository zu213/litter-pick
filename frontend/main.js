
const roadsJSON = await(await fetch('./geojson.json')).json()
var selectedRoadCardElement = null
var selectedRoad = null

var loggedIn = false

var unnamedCounter = 0
var loginElement = null

// Map bounds
const bounds = L.latLngBounds(
  [51.748, -0.606], // SW corner
  [51.780, -0.530]  // NE corner
)

// Setup map
const map = L.map('map', {
  worldCopyJump: false,
  maxBounds: bounds,
  maxBoundsViscosity: 1.0,
  minZoom: 14,
  maxZoom: 18
}).setView([51.7605, -0.566], 16)

map.fitBounds(bounds)

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map)

const roadStyle = {
  'color': '#ff7800',
  'weight': 5,
  'opacity': 0.65
}

const roadHoverStyle = {
  color: '#00ffff',
  weight: 7,
  opacity: 1
};

const roadSelectedStyle = {
  color: '#46ec49ff',
  weight: 7,
  opacity: 1
};

roadsJSON['features'] = roadsJSON['features'].map((feature) => {
  if(!feature['id']) feature['id'] = crypto.randomUUID()
  return feature
})

const startLogin = () => {
  const loginPopup = document.createElement('div')
  loginPopup.className = 'login-mask'
  loginPopup.addEventListener('click', () => dismissLogin())
  loginElement = loginPopup

  const loginMenu = document.createElement('div')
  loginMenu.className = 'login-menu'
  loginMenu.innerText = 'login'
  loginMenu.addEventListener('click', e => e.stopPropagation())
  loginPopup.appendChild(loginMenu)

  document.body.appendChild(loginPopup)
}

const dismissLogin = () => {
  if(loginElement) document.body.removeChild(loginElement)
  loginElement = null
}

const joinArea = (feature) => {
}

// Structured clone to copy by value
// Setup cards for roads
const features = structuredClone(roadsJSON['features']);
const cardHolderElement = document.getElementById('area-cards')

for(const feature of features) {

  const button = document.createElement('button');
  if(loggedIn) {
    button.innerText = 'Join'
    button.addEventListener('click', () => joinArea(feature))
  } else {
    button.innerText = 'Login to Join'
    button.addEventListener('click', () => startLogin())
  }

  const cardElement = document.createElement('div')
  cardElement.id = feature['id'] 
  cardElement.className = 'area-card'
  // Gonna need backend for this - will get json from backend
  let name
  if(feature['properties'] && feature['properties']['name']) {
    name = feature['properties']['name']
  } else {
    name = `Unnamed area: ${unnamedCounter}`
    unnamedCounter++
  }
  cardElement.innerHTML = `
    <div>Area: ${feature['properties']['name'] ?? `Unnamed area: ${unnamedCounter}`}</div>
    <div>Volunteers: ${feature['volunteers'] ?? 'No volunteers for area found'}</div>
  `
  cardElement.appendChild(button)
  cardHolderElement.appendChild(cardElement)
}

// Clean up any dirtying of json I perform - not needed for now
// roadsJSON['features'] = roadsJSON['features'].map(feature => {
//   delete feature['id']
//   return feature
// })

const selectRoad = (roadCardElement, roadElement) => {
  selectedRoadCardElement?.classList.remove('selected')

  // format area cards
  const areaCardElement = document.getElementById('area-cards')
  areaCardElement.classList.add('visible')
  roadCardElement.scrollIntoView()
  roadCardElement.classList.add('selected')
  selectedRoadCardElement = roadCardElement

  selectedRoad?.setStyle(roadStyle)
  roadElement.setStyle(roadSelectedStyle)
  selectedRoad = roadElement
}

// Add roads
L.geoJSON(roadsJSON, {
  onEachFeature: (feature, layer) => {
    layer.on('click', (e) => {
      const roadCardElement = document.getElementById(feature['id'])
      selectRoad(roadCardElement, e.target)
    })

    layer.on('mouseover', (e) => {
      if(e.target != selectedRoad) {
        e.target.setStyle(roadHoverStyle)
      }
    })

    layer.on('mouseout', (e) => {
      if(e.target != selectedRoad) {
        e.target.setStyle(roadStyle)
      }
    });
  },
  style: roadStyle
}).addTo(map)