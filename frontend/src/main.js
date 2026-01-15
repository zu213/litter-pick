import { selectRoadCard, startSidebarFlow } from "./sidebar.js"

const coords = {n: 51.748, e: -0.606, s: 51.780, w: -0.530}

const getRoadJSON = async (coords) => {
  return (fetch('http://127.0.0.1:8080/roads/', {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer`,
    },
    body: JSON.stringify(
      coords,
    ),
  })).then(response => {
    if(response.ok) return response.json()
  })
}

const roadsJSON = await getRoadJSON(coords)

var selectedRoad = null

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

const joinArea = (feature) => {
}

// Structured clone to copy by value
// Setup cards for roads
const features = structuredClone(roadsJSON['features']);

startSidebarFlow(features)

// KEEP PLEASE
// Clean up any dirtying of json I perform - not needed for now
// roadsJSON['features'] = roadsJSON['features'].map(feature => {
//   delete feature['id']
//   return feature
// })

const selectRoad = (roadCardElement, roadElement) => {
  selectRoadCard(roadCardElement)

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
